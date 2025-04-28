import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { IDL } from "../constants/idl.js";
import { PublicKey } from "@solana/web3.js";
import CampaignCard from "@/components/campaign/CampaignCard.js";
import { PROGRAM_ID as PDA_ID } from "../constants/programID.js";
import { supabase } from "@/lib/supabase";

const Explore: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [onChain, setOnChain] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const PROGRAM_ID = new PublicKey(PDA_ID);

  // Fetch all on-chain campaigns
  useEffect(() => {
    // if (!wallet) return;
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    const program = new Program(IDL, PROGRAM_ID, provider);

    (async () => {
      try {
        const accounts = await program.account.campaign.all();
        setOnChain(accounts);
      } catch (err) {
        console.error("Failed to fetch on-chain campaigns", err);
      }
    })();
  }, [connection, wallet]);

  // Enrich on-chain data with Supabase metadata
  useEffect(() => {
    if (onChain.length === 0) return;

    (async () => {
      // batch query Supabase for all campaign IDs
      const ids = onChain.map((c) => c.publicKey.toBase58());
      const { data: metaRows, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("id", ids as string[]);
      console.log(metaRows);
      if (error) {
        console.error("Supabase metadata fetch error:", error);
        return;
      }

      // map onChain + metadata
      const results = onChain
        .map((c) => {
          const meta = metaRows?.find((m) => {
            return m.id === c.publicKey.toBase58();
          });
          if (!meta) return null;
          return {
            publicKey: c.publicKey,
            owner: c.account.owner,
            amountRaised: Number(c.account.amountRaised) / 1e9,
            finalized: c.account.finalized,
            metadata: meta,
          };
        })
        .filter((r) => r !== null);
      setCampaigns(results);
      console.log(onChain);
    })();
  }, [onChain]);

  return (
    <div className="bg-[#181A1F] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl text-white tracking-tight mr-auto">
            Explore NFT Campaigns
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-white hover:border-emerald transition-all shadow"
            >
              <Filter className="mr-1 h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-white hover:border-emerald transition-all shadow"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Campaign Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <CampaignCard
                key={c.publicKey.toBase58()}
                id={c.publicKey.toBase58()}
                title={c.metadata.title}
                description={c.metadata.description}
                imageUrl={c.metadata.image_urls?.[0] || c.metadata.image_url}
                raised={c.amountRaised}
                goal={c.metadata.goal_sol}
                daysLeft={c.metadata.days_left}
                expiration={c.metadata.expiration}
                creator={c.metadata.owner}
                campaignId={c.metadata.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
