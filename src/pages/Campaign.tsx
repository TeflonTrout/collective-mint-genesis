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
import { formatDistanceToNowStrict } from "date-fns";

const PROGRAM_ID = new PublicKey(PDA_ID);

interface SupabaseCampaign {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  image_url: string;
  image_urls: string[];
  days_left: number;
  goal_sol: number;
  expiration: string;
  campaign_id: string;
  tiers: Tier[];
}

interface Tier {
  amount: number;
  title: string;
  description: string;
  nftRewardCount: number;
}

export default function Campaign() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [meta, setMeta] = useState<SupabaseCampaign | null>(null);
  const [onChain, setOnChain] = useState<{
    amountRaised: number;
    goal: number;
    owner: string;
    deadline: number;
    finalized: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "info" | "faq">(
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
      const account = await program.account.campaign.fetch(data.id);

      // 3️⃣ Fetch on-chain account
      setOnChain({
        amountRaised: account.amountRaised.toNumber() / 1e9,
        owner: account.owner.toBase58(),
        goal: account.goal.toNumber(),
        deadline: account.deadline.toNumber(),
        finalized: account.finalized,
      });

      setLoading(false);
    };

    fetchData();
  }, [campaignId, connection, wallet]);

  const handleContributeTier = async (amount: number, tierIndex: number) => {
    if (!wallet) throw new Error("Connect your wallet");
    try {
      const idBytes = utils.bytes.utf8.encode(meta.campaign_id);

      if (amount != meta.tiers[tierIndex].amount) {
        alert(
          `Please contribute ${meta.tiers[tierIndex].amount} SOL to tier #${
            tierIndex + 1
          }`
        );
        return;
      }

      const [campaignPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign"),
          new PublicKey(onChain.owner).toBuffer(),
          idBytes,
        ],
        PROGRAM_ID
      );
      // derive vault PDA
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

      await program.methods
        .contribute(new BN(amount * LAMPORTS_PER_SOL))
        .accounts({
          campaign: campaignPda,
          vault: vaultPda,
          contributor: wallet.publicKey,
          claim: claimPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      // 2. record tierIndex off-chain (if you want), or just let the claim flow handle it
      alert(`Contributed ${amount} SOL to tier #${tierIndex + 1}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !meta || !onChain) return <p>Loading…</p>;

  // Compute status & days left
  const now = Date.now() / 1000;
  const status =
    now > onChain.deadline
      ? onChain.amountRaised >= onChain.goal
        ? "Funded"
        : "Failed"
      : "Ongoing";
  const daysLeft = Math.max(0, Math.ceil((onChain.deadline - now) / 86400));

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">{meta.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: main campaign info */}
        <div className="md:col-span-2 space-y-6">
          <img
            src={meta.image_url}
            alt={meta.title}
            className="w-full h-80 object-cover rounded-lg"
          />
          <div className="space-y-2">
            <div className="w-full bg-gray-700 h-4 rounded">
              <div
                className="bg-emerald h-4 rounded"
                style={{
                  width: `${(onChain.amountRaised / onChain.goal) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                {onChain.amountRaised} / {onChain.goal / LAMPORTS_PER_SOL} SOL
                raised
              </p>
              <p className="text-sm text-muted-foreground">
                {((onChain.amountRaised / onChain.goal) * 100).toFixed(0)}%
              </p>
            </div>
            <div>{formatDistanceToNowStrict(meta.expiration)} left</div>
          </div>
          <div className="flex space-x-4 border-b border-border mb-6">
            <button
              className={`py-2 px-4 ${
                activeTab === "description"
                  ? "border-b-2 border-emerald font-bold"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "info"
                  ? "border-b-2 border-emerald font-bold"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("info")}
            >
              Info
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === "faq"
                  ? "border-b-2 border-emerald font-bold"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("faq")}
            >
              FAQ
            </button>
          </div>

          <div className="prose prose-invert max-w-none">
            {activeTab === "description" && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
              >
                {meta.long_description}
              </ReactMarkdown>
            )}

            {activeTab === "info" && (
              <div>
                <p>
                  <strong>Creator:</strong> {onChain.owner}
                </p>
                <p>
                  <strong>Socials:</strong> (Add socials field later in your
                  metadata)
                </p>
                <p>
                  <strong>Website:</strong> (Add website field later in your
                  metadata)
                </p>
              </div>
            )}

            {activeTab === "faq" && (
              <div>
                <h3>Frequently Asked Questions</h3>
                <p>Q: How do I contribute?</p>
                <p>
                  A: Choose a reward tier on the right and confirm your
                  transaction!
                </p>
                <p>Q: What happens if the campaign fails?</p>
                <p>
                  A: All contributors will be eligible for a refund if the
                  campaign doesn't reach its goal.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: rewards & actions */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <h2 className="text-xl font-semibold">Support & Reward</h2>

          {meta.tiers.map((tier, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center py-4 border-b last:border-b-0"
            >
              <div>
                <p className="font-bold">{tier.title}</p>
                <p className="text-sm text-muted-foreground">
                  {tier.nftRewardCount} NFT
                </p>
              </div>
              <Button
                onClick={() => handleContributeTier(tier.amount, idx)}
                disabled={status !== "Ongoing"}
              >
                {status === "Ongoing" ? `${tier.amount} SOL` : "Closed"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
