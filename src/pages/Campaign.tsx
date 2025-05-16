// src/pages/CampaignDetail.tsx
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, BN, Program, utils } from "@project-serum/anchor";
import { IDL } from "../constants/idl";
import { supabase } from "@/lib/supabase";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { PROGRAM_ID as PDA_ID } from "../constants/programID";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import {
  differenceInDays,
  format,
  formatDistanceToNowStrict,
  isFuture,
} from "date-fns";
import { Calendar } from "lucide-react";
import { SupabaseCampaign } from "@/types/supabase";
import BackersTab from "@/components/campaign/BackersTab";
import Heading from "@/components/campaign/Heading";
import { toast } from "sonner";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { FaSpinner } from "react-icons/fa6";

const PROGRAM_ID = new PublicKey(PDA_ID);

export interface Backer {
  publicKey: PublicKey;
  account: Account;
}

export interface Account {
  campaign: string;
  contributor: PublicKey;
  amount: BN;
  refunded: boolean;
}

export interface Rating {
  id: string;
  campaign_id: string;
  comment: string;
  contributor: string;
  score: number;
  created_at: string;
}

export default function Campaign() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [meta, setMeta] = useState<SupabaseCampaign | null>(null);
  const [backers, setBackers] = useState<Backer[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [onChain, setOnChain] = useState<{
    amountRaised: number;
    goal: number;
    owner: string;
    deadline: number;
    finalized: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "faq" | "backers">(
    "description"
  );

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, PROGRAM_ID, provider);
  const LAMPORTS_PER_SOL = 1000000000;

  useEffect(() => {
    if (!campaignId) return;
    setLoading(true);

    const fetchData = async () => {
      // 1️⃣ Fetch metadata from Supabase
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      if (error) {
        console.error(error);
        return;
      }
      setMeta(data!);

      const { data: ratings, error: ratingsError } = await supabase
        .from("ratings")
        .select("*")
        .eq("campaign_id", campaignId);
      setRatings(ratings);
      const account = await program.account.campaign.fetch(data.id);
      const claims = await program.account.claim.all();
      const filtered = claims.filter(
        (a) => a.account.campaign.toBase58() === campaignId
      );
      setBackers(filtered);

      // 3️⃣ Fetch on-chain account
      setOnChain({
        amountRaised: account.amountRaised.toNumber() / LAMPORTS_PER_SOL,
        owner: account.owner.toBase58(),
        goal: account.goal.toNumber() / LAMPORTS_PER_SOL,
        deadline: account.deadline.toNumber(),
        finalized: account.finalized,
      });

      setLoading(false);
    };

    fetchData();
  }, [campaignId, connection, wallet]);

  if (!onChain) return null;
  const now = Date.now() / 1000;
  const daysLeft = formatDistanceToNowStrict(
    new Date(onChain?.deadline * 1000)
  );
  const isFunded = onChain.amountRaised >= onChain.goal;
  const isAlmostUp =
    !isFunded &&
    differenceInDays(new Date(onChain.deadline * 1000), new Date()) < 3 &&
    isFuture(new Date(onChain.deadline * 1000));

  const handleContributeTier = async (
    amount: number,
    tierIndex: number,
    nftsDue: number
  ) => {
    if (!wallet) throw new Error("Connect your wallet");
    try {
      // enforce exact per‐tier amount
      if (amount !== meta.tiers[tierIndex].amount) {
        toast.error(`Contribute exactly ${meta.tiers[tierIndex].amount} SOL`);
        return;
      }

      const idBytes = utils.bytes.utf8.encode(meta.campaign_id);
      const [campaignPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign"),
          new PublicKey(onChain.owner).toBuffer(),
          Buffer.from(idBytes),
        ],
        PROGRAM_ID
      );
      const [vaultPda] = await PublicKey.findProgramAddress(
        [Buffer.from("vault"), campaignPda.toBuffer()],
        PROGRAM_ID
      );
      const [claimPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("claim"),
          campaignPda.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        PROGRAM_ID
      );
      const [founderVaultPda] = await PublicKey.findProgramAddress(
        [Buffer.from("founder_vault")],
        PROGRAM_ID
      );

      // ✏️ Pass both amount & nfts_due here:
      await program.methods
        .contribute(new BN(amount * LAMPORTS_PER_SOL), new BN(nftsDue))
        .accounts({
          campaign: campaignPda,
          vault: vaultPda,
          contributor: wallet.publicKey,
          claim: claimPda,
          owner: meta.owner,
          founderVault: founderVaultPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // now record on‐chain + off‐chain
      const { error } = await supabase.from("claims").upsert(
        {
          campaign_id: meta.campaign_id,
          contributor: wallet.publicKey.toBase58(),
          amount: amount * LAMPORTS_PER_SOL,
          nfts_due: nftsDue,
          refunded: false,
        },
        { onConflict: "campaign_id, contributor" }
      );

      if (error) console.error("upsert error", error);

      toast.success("Contribution submitted.");
      window.location.reload();
    } catch (e) {
      console.error("Error contributing:", e);
      toast.error("Error contributing.");
    }
  };

  if (loading || !meta || !onChain)
    return (
      <div className="text-center py-16">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
          Loading <FaSpinner className="animate-spin" />
        </h1>
      </div>
    );

  // Compute status & days left
  const status =
    now > onChain.deadline
      ? onChain.amountRaised >= onChain.goal
        ? "Funded"
        : "Failed"
      : "Ongoing";

  return (
    <div className="container mx-auto py-12">
      <div className="flex text-2xl items-center justify-between">
        <Heading
          meta={meta}
          onChain={onChain}
          ratings={ratings}
          reviewCount={ratings.length}
        />
      </div>

      <div className="mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* ── Left: main campaign info ── */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative w-auto h-auto max-h-[500px] aspect-auto rounded-lg overflow-hidden z-0">
              {meta.image_urls?.length > 1 ? (
                <Swiper
                  modules={[Navigation, Pagination]}
                  spaceBetween={10}
                  slidesPerView={1}
                  navigation={{
                    nextEl: `.next-${meta.id}`,
                    prevEl: `.prev-${meta.id}`,
                  }}
                  pagination={{ clickable: true }}
                  className="h-full w-full"
                >
                  {meta.image_urls.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={`${meta.title} ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <img
                  src={meta.image_url}
                  alt={meta.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}

              {/* Navigation buttons */}
              {meta.image_urls?.length > 1 && (
                <>
                  <button
                    className={`prev-${meta.id} swiper-button-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-emerald`}
                  />
                  <button
                    className={`next-${meta.id} swiper-button-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-emerald`}
                  />
                </>
              )}

              {isFunded && (
                <div className="absolute top-2 left-2 bg-emerald text-white px-3 py-1 rounded-full shadow-lg font-bold text-sm sm:text-base flex items-center z-10">
                  100% Funded!
                </div>
              )}
              {isAlmostUp && (
                <div className="absolute top-2 left-2 bg-red-600 text-white px-3 py-1 rounded-full shadow-lg font-bold text-sm sm:text-base flex items-center z-10">
                  Only {daysLeft} left!
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-700 h-3 rounded">
                <div
                  className="bg-emerald h-3 rounded"
                  style={{
                    width: `${(onChain.amountRaised / onChain.goal) * 100}%`,
                    minWidth: onChain.amountRaised > 0 ? "5%" : "0%",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                <span>
                  {onChain.amountRaised} / {onChain.goal} SOL raised
                </span>
                <span>
                  {((onChain.amountRaised / onChain.goal) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-white text-xs sm:text-lg text-muted-foreground">
                <Calendar className="inline-block" />
                {isFuture(meta.expiration) ? (
                  <>
                    <span className="font-bold">
                      {formatDistanceToNowStrict(meta.expiration)} left
                    </span>
                    <span className="hidden sm:inline text-muted-foreground">
                      (Ends {format(meta.expiration, "MMM dd, yyyy h:mm a")})
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-red-600">Expired</span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <div className="flex space-x-4 border-b border-border mb-4">
                <button
                  className={`py-2 px-3 text-sm font-semibold ${
                    activeTab === "description"
                      ? "border-b-2 border-emerald text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button
                  className={`py-2 px-3 text-sm font-semibold ${
                    activeTab === "backers"
                      ? "border-b-2 border-emerald text-white"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setActiveTab("backers")}
                >
                  Backers
                </button>
              </div>
              <div className="prose prose-invert max-w-none text-sm sm:text-base">
                {activeTab === "description" && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {meta.long_description}
                  </ReactMarkdown>
                )}
                {activeTab === "faq" && (
                  <div>
                    <h3>Frequently Asked Questions</h3>
                    {/* ... */}
                  </div>
                )}
                {activeTab === "backers" && <BackersTab backers={backers} />}
              </div>
            </div>
          </div>

          {/* ── Right: support & rewards ── */}
          <aside className="bg-card border border-border rounded-lg p-4 sm:p-6 lg:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold border-b border-border pb-2">
              Support & Rewards
            </h2>

            <div className="space-y-4">
              {meta.tiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 justify-between items-center py-4 gap-4 border-b last:border-b-0"
                >
                  <div className="col-span-2 flex flex-col justify-start items-start">
                    <p className="font-bold text-lg">{tier.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {tier.description}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleContributeTier(
                        tier.amount,
                        idx,
                        tier.nftRewardCount
                      )
                    }
                    disabled={
                      status !== "Ongoing" ||
                      onChain.amountRaised + tier.amount > onChain.goal
                    }
                    className="col-span-1 w-full border-emerald text-emerald hover:bg-emerald/10 relative overflow-hidden group"
                  >
                    {status === "Ongoing" ? `${tier.amount} SOL` : "Closed"}
                  </Button>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
