// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, utils } from "@project-serum/anchor";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";
import { IDL } from "../constants/idl";
import { Button } from "@/components/ui/button";
import CampaignCard from "@/components/campaign/CampaignCard";
import { PROGRAM_ID as PDA_ID } from "../constants/programID";
import type { SupabaseCampaign } from "@/types/supabase";
import { getUnixTime } from "date-fns";
import { FaSpinner } from "react-icons/fa6";
import { toast } from "sonner";

const PROGRAM_ID = new PublicKey(PDA_ID);
const HELIUS_RPC =
  "https://devnet.helius-rpc.com/?api-key=44b3f1ce-e416-47ba-9971-1b5aa9009b6a";

export default function Profile() {
  const { walletPublicKey } = useParams<{ walletPublicKey: string }>();
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  const { connection: defaultConnection } = useConnection();
  const helliusConnection = new Connection(HELIUS_RPC, {
    commitment: "confirmed",
  });

  const [created, setCreated] = useState<SupabaseCampaign[]>([]);
  const [backed, setBacked] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const tabs: ("active" | "backed" | "completed" | "funded" | "failed")[] = [
    "active",
    "backed",
    "completed",
    "funded",
  ];

  // which tab is showing?
  const [activeTab, setActiveTab] = useState<
    "active" | "backed" | "completed" | "failed" | "funded"
  >("active");

  const isOwner = wallet?.publicKey?.toBase58() === walletPublicKey;
  if (isOwner) {
    tabs.push("failed");
  }
  const provider = new AnchorProvider(helliusConnection, wallet!, {});
  const program = new Program(IDL, PROGRAM_ID, provider);

  // helper: how much was raised on a created campaign?
  const getCreatedRaised = (campaignId: string) =>
    claims
      .filter((c) => c.account.campaign.toBase58() === campaignId)
      .reduce((sum, c) => sum + c.account.amount.toNumber() / 1e9, 0);

  useEffect(() => {
    if (!walletPublicKey) {
      navigate("/");
      return;
    }
    setLoading(true);

    (async () => {
      // 1) load your own created campaigns
      const { data: createdRows } = await supabase
        .from("campaigns")
        .select("*")
        .eq("owner", walletPublicKey);
      setCreated(createdRows || []);

      // 2) load all claim accounts
      const allClaims = await program.account.claim.all();
      setClaims(allClaims);

      // 3) load Supabase metadata for those you backed
      const backedIds = allClaims.map((c) => c.account.campaign.toBase58());
      const { data: metaRows } = await supabase
        .from("campaigns")
        .select("*")
        .in("id", backedIds);

      // 4) fetch on-chain for each backed campaign
      const onChain = await Promise.all(
        allClaims.map((c) => program.account.campaign.fetch(c.account.campaign))
      );

      // 5) zip into one backed list
      const list = allClaims.map((c, i) => {
        const claim = c.account;
        const meta = metaRows!.find((m) => m.id === claim.campaign.toBase58())!;
        const oc = onChain[i];
        return {
          campaignPda: claim.campaign,
          contributedSol: claim.amount.toNumber() / 1e9,
          refunded: claim.refunded,
          metadata: meta,
          onChain: {
            amountRaised: oc.amountRaised.toNumber() / 1e9,
            goal: oc.goal.toNumber() / 1e9,
            deadline: oc.deadline.toNumber(), // unix secs
            finalized: oc.finalized,
          },
        };
      });
      const deduped = list.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (x) => x.campaignPda.toBase58() === item.campaignPda.toBase58()
          )
      );

      setBacked(deduped);
      setLoading(false);
    })();
  }, [walletPublicKey]);

  // refund handler unchanged
  const handleClaimRefund = async (b) => {
    try {
      const idBytes = utils.bytes.utf8.encode(b.metadata.id);
      const [campaignPda] = await PublicKey.findProgramAddress(
        [
          Buffer.from("campaign"),
          new PublicKey(b.metadata.owner).toBuffer(),
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
          wallet!.publicKey!.toBuffer(),
        ],
        PROGRAM_ID
      );

      await program.methods
        .claimRefund()
        .accounts({
          campaign: campaignPda,
          vault: vaultPda,
          claim: claimPda,
          contributor: wallet!.publicKey!,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      toast.success("Refund successful! 💸");
      setBacked((prev) =>
        prev.map((x) =>
          x.campaignPda.equals(b.campaignPda) ? { ...x, refunded: true } : x
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Refund failed: " + err.message);
    }
  };

  if (loading) {
    return (
      <h1 className="w-full flex items-center justify-center gap-4 text-2xl font-bold py-16">
        Loading profile <FaSpinner className="animate-spin" />
      </h1>
    );
  }

  // time helpers
  const now = Date.now();
  const nowUnix = getUnixTime(new Date());

  // Tab-specific filters
  const activeCreated = created.filter(
    (c) => new Date(c.expiration).getTime() > now
  );
  const archiveCreated = created.filter((c) => {
    const ended = new Date(c.expiration).getTime() <= now;
    const raised = getCreatedRaised(c.id);
    return ended && raised >= c.goal_sol;
  });

  const activeBacked = backed.filter((b) => b.onChain.deadline > nowUnix);
  const archiveBacked = backed.filter((b) => {
    const ended = b.onChain.deadline <= nowUnix;
    const funded = b.onChain.amountRaised >= b.onChain.goal;
    return ended && funded;
  });

  const failedBacked = backed.filter((b) => {
    if (b.onChain.deadline > 15097851037914) return;
    const ended = b.onChain.deadline <= nowUnix;
    const funded = b.onChain.amountRaised >= b.onChain.goal;
    return ended && !funded && !b.refunded;
  });

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl text-center font-bold mb-6">
        User: {walletPublicKey.slice(0, 5)}...{walletPublicKey.slice(-5)}
      </h1>

      {/* Tabs */}
      <div className="flex border-b mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={
              "capitalize px-6 py-2 font-medium " +
              (activeTab === tab
                ? "border-b-2 border-emerald text-white"
                : "text-muted-foreground")
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {/* Active Created */}
      {activeTab === "active" && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Active Campaigns</h2>
          {activeCreated.length === 0 ? (
            <p className="text-muted-foreground">None currently active.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeCreated.map((c) => (
                <CampaignCard
                  key={c.id}
                  campaignId={c.id}
                  id={c.id}
                  title={c.title}
                  description={c.short_description}
                  imageUrl={c.image_urls?.[0] || c.image_url}
                  raised={getCreatedRaised(c.id)}
                  goal={c.goal_sol}
                  expiration={c.expiration}
                  daysLeft={Math.max(
                    0,
                    Math.ceil(
                      (new Date(c.expiration).getTime() - now) / 86400000
                    )
                  )}
                  creator={c.owner}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Active Backed */}
      {activeTab === "backed" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Active Backed Campaigns
          </h2>
          {activeBacked.length === 0 ? (
            <p className="text-muted-foreground">None currently active.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {activeBacked.map((b) => (
                <CampaignCard
                  key={b.campaignPda.toBase58()}
                  id={b.campaignPda.toBase58()}
                  campaignId={b.metadata.id}
                  title={b.metadata.title}
                  description={b.metadata.short_description}
                  imageUrl={b.metadata.image_urls?.[0] || b.metadata.image_url}
                  raised={b.contributedSol}
                  goal={b.onChain.goal}
                  daysLeft={Math.max(0, b.onChain.deadline - nowUnix)}
                  expiration={b.metadata.expiration}
                  creator={b.metadata.owner}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Completed Created */}
      {activeTab === "completed" && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Completed Campaigns</h2>
          {archiveCreated.length === 0 ? (
            <p className="text-muted-foreground">
              No successful campaigns yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {archiveCreated.map((c) => (
                <CampaignCard
                  key={c.id}
                  id={c.id}
                  campaignId={c.id}
                  title={c.title}
                  description={c.short_description}
                  imageUrl={c.image_urls?.[0] || c.image_url}
                  raised={getCreatedRaised(c.id)}
                  goal={c.goal_sol}
                  expiration={c.expiration}
                  daysLeft={0}
                  creator={c.owner}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "failed" && isOwner && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Failed Campaigns (Claim Refunds)
          </h2>
          {failedBacked.length === 0 ? (
            <p className="text-muted-foreground">No refunds available.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {failedBacked.map((b) => (
                <div
                  key={b.campaignPda.toBase58()}
                  className="flex flex-col justify-between hover:shadow transition-shadow duration-200"
                >
                  <CampaignCard
                    id={b.campaignPda.toBase58()}
                    campaignId={b.metadata.id}
                    title={b.metadata.title}
                    description={b.metadata.short_description}
                    imageUrl={
                      b.metadata.image_urls?.[0] || b.metadata.image_url
                    }
                    raised={b.contributedSol}
                    goal={b.onChain.goal}
                    daysLeft={Math.max(0, b.onChain.deadline - nowUnix)}
                    expiration={b.metadata.expiration}
                    creator={b.metadata.owner}
                  />
                  <Button
                    onClick={() => handleClaimRefund(b)}
                    className="w-full mt-4 bg-emerald hover:bg-emerald/80 transition text-white"
                  >
                    Claim Refund
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Funded Backed */}
      {activeTab === "funded" && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            Backed Campaigns (Funded)
          </h2>
          {archiveBacked.length === 0 ? (
            <p className="text-muted-foreground">
              No funded campaigns backed yet.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {archiveBacked.map((b) => (
                <CampaignCard
                  key={b.campaignPda.toBase58()}
                  id={b.campaignPda.toBase58()}
                  campaignId={b.metadata.id}
                  title={b.metadata.title}
                  description={b.metadata.short_description}
                  imageUrl={b.metadata.image_urls?.[0] || b.metadata.image_url}
                  raised={b.contributedSol}
                  goal={b.onChain.goal}
                  daysLeft={0}
                  expiration={b.metadata.expiration}
                  creator={b.metadata.owner}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
