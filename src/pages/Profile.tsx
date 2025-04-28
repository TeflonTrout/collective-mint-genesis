// src/pages/Profile.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, utils } from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { supabase } from "@/lib/supabase";
import { IDL } from "../constants/idl";
import { Button } from "@/components/ui/button";
import CampaignCard from "@/components/campaign/CampaignCard";
import { PROGRAM_ID as PDA_ID } from "../constants/programID";

const PROGRAM_ID = new PublicKey(PDA_ID);
const CLAIM_CONTRIBUTOR_OFFSET = 8 + 32; // Anchor discriminator + campaign Pubkey

export default function Profile() {
  const { walletPublicKey } = useParams<{ walletPublicKey: string }>();
  const wallet = useAnchorWallet();
  const navigate = useNavigate();
  const { connection } = useConnection();

  const [created, setCreated] = useState([]);
  const [backed, setBacked] = useState([]);
  const [loading, setLoading] = useState(true);

  // Can toggle “Your Refunds” when viewing your own profile:
  const isOwner = wallet?.publicKey?.toBase58() === walletPublicKey;

  // Anchor program
  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, PROGRAM_ID, provider);

  useEffect(() => {
    if (!walletPublicKey) {
      navigate("/");
      return;
    }
    setLoading(true);

    (async () => {
      // — Fetch campaigns _created_ by this wallet from Supabase
      const { data: createdRows } = await supabase
        .from("campaigns")
        .select("*")
        .eq("owner", walletPublicKey);
      setCreated(createdRows || []);

      // — Fetch on-chain Claim accounts where contributor == walletPublicKey
      const claims = await program.account.claim.all([
        {
          memcmp: {
            offset: CLAIM_CONTRIBUTOR_OFFSET,
            bytes: walletPublicKey!,
          },
        },
      ]);

      // — Pull Supabase meta for each backed campaign
      const campaignIds = claims.map((c) => c.account.campaign.toBase58());
      const { data: metaRows } = await supabase
        .from("campaigns")
        .select("*")
        .in("id", campaignIds);

      // — Fetch on-chain state for each campaign
      const onChainStates = await Promise.all(
        claims.map((c) => program.account.campaign.fetch(c.account.campaign))
      );

      // — Zip into backed list
      const backedList = claims.map((c, i) => {
        const claim = c.account;
        const meta = metaRows!.find((m) => m.id === claim.campaign.toBase58())!;
        const oc = onChainStates[i];
        return {
          campaignPda: claim.campaign,
          contributedSol: claim.amount.toNumber() / 1e9,
          refunded: claim.refunded,
          metadata: meta,
          onChain: {
            amountRaised: oc.amountRaised.toNumber() / 1e9,
            goal: oc.goal.toNumber(),
            deadline: oc.deadline.toNumber(),
            finalized: oc.finalized,
          },
        };
      });

      setBacked(backedList);
      setLoading(false);
    })();
  }, [walletPublicKey, connection]);

  const handleClaimRefund = async (b) => {
    try {
      const idBytes = utils.bytes.utf8.encode(b.metadata.campaign_id);
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

      alert("Refund successful! 💸");
      setBacked((prev) =>
        prev.map((x) =>
          x.campaignPda.equals(b.campaignPda) ? { ...x, refunded: true } : x
        )
      );
    } catch (err) {
      console.error(err);
      alert("Refund failed: " + err.message);
    }
  };

  if (loading) return <p className="p-8">Loading profile…</p>;

  return (
    <div className="container mx-auto py-12 space-y-16">
      <h1 className="text-3xl font-bold">Profile: {walletPublicKey}</h1>

      {/* — Created Campaigns */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Created Campaigns</h2>
        {created.length === 0 ? (
          <p className="text-muted-foreground">No campaigns created yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {created.map((c) => (
              <CampaignCard
                key={c.id}
                id={c.id}
                title={c.title}
                description={c.short_description}
                imageUrl={c.image_urls?.[0] || c.image_url}
                raised={0} // optionally fetch on-chain data
                goal={c.goal_sol}
                campaignId={c.id}
                expiration={c.expiration}
                daysLeft={Math.max(
                  0,
                  Math.ceil(
                    (new Date(c.expiration).getTime() - Date.now()) / 86400000
                  )
                )}
                creator={c.owner}
              />
            ))}
          </div>
        )}
      </section>

      {/* — Backed Campaigns */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Backed Campaigns</h2>
        {backed.length === 0 ? (
          <p className="text-muted-foreground">No contributions yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {backed.map((b) => {
              const now = Date.now() / 1000;
              const expired = now > b.onChain.deadline;
              const funded = b.onChain.amountRaised >= b.onChain.goal;
              const status = expired
                ? funded
                  ? "Funded"
                  : "Failed"
                : "Ongoing";

              return (
                <div key={b.campaignPda.toBase58()} className="relative">
                  <CampaignCard
                    id={b.campaignPda.toBase58()}
                    campaignId={b.metadata.id}
                    title={b.metadata.title}
                    description={b.metadata.short_description}
                    imageUrl={
                      b.metadata.image_urls?.[0] || b.metadata.image_url
                    }
                    raised={b.onChain.amountRaised}
                    expiration={b.metadata.expiration}
                    goal={b.onChain.goal}
                    daysLeft={Math.max(
                      0,
                      Math.ceil((b.onChain.deadline - now) / 86400)
                    )}
                    creator={b.metadata.owner}
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-xs rounded text-white">
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* — Refunds (only on your own profile) */}
      {isOwner && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Failed Campaigns (Claim Refunds)
          </h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {backed
              .filter((b) => {
                const now = Date.now() / 1000;
                const expired = now > b.onChain.deadline;
                const funded = b.onChain.amountRaised >= b.onChain.goal;
                return expired && !funded && !b.refunded;
              })
              .map((b) => (
                <div
                  key={b.campaignPda.toBase58()}
                  className="p-5 bg-card border border-border rounded-lg flex flex-col justify-between hover:shadow transition-shadow duration-200"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold">{b.metadata.title}</h3>
                    <p className="text-sm text-muted-foreground italic">
                      This one ran out of steam... but your contribution is
                      safe!
                    </p>
                    <p className="text-md">
                      You can reclaim{" "}
                      <span className="font-semibold">
                        {b.contributedSol} SOL
                      </span>
                      .
                    </p>
                  </div>
                  <Button
                    onClick={() => handleClaimRefund(b)}
                    className="mt-4 bg-emerald hover:bg-emerald/80 transition text-white"
                  >
                    Claim Your Refund
                  </Button>
                </div>
              ))}
            {backed.filter((b) => {
              const now = Date.now() / 1000;
              const expired = now > b.onChain.deadline;
              const funded = b.onChain.amountRaised >= b.onChain.goal;
              return expired && !funded && !b.refunded;
            }).length === 0 && (
              <p className="text-muted-foreground col-span-full">
                No refunds available.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
