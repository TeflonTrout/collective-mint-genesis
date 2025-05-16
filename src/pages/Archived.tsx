import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { IDL } from "../constants/idl.js";
import { Connection, PublicKey } from "@solana/web3.js";
import CampaignCard from "@/components/campaign/CampaignCard.js";
import { PROGRAM_ID as PDA_ID } from "../constants/programID.js";
import { supabase } from "@/lib/supabase";
import { isFuture } from "date-fns";
import { SupabaseCampaign } from "@/types/supabase.js";
import { FaSpinner } from "react-icons/fa6";

interface Campaign {
  publicKey: PublicKey;
  owner: string;
  amountRaised: number;
  finalized: boolean;
  metadata: SupabaseCampaign;
}

const HELIUS_RPC =
  "https://devnet.helius-rpc.com/?api-key=44b3f1ce-e416-47ba-9971-1b5aa9009b6a";

const Explore: React.FC = () => {
  const { connection: defaultConnection } = useConnection();
  const wallet = useAnchorWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [onChain, setOnChain] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);

      // Helper: fetch with a given connection
      const fetchAll = async (conn: Connection) => {
        const programId = new PublicKey(PDA_ID);
        const provider = new AnchorProvider(
          conn,
          wallet,
          AnchorProvider.defaultOptions()
        );
        const program = new Program(IDL, programId, provider);
        const accounts = await program.account.campaign.all();
        return accounts;
      };

      let accounts;
      try {
        // 1️⃣ Try default RPC
        accounts = await fetchAll(defaultConnection);
      } catch (err) {
        console.warn("Default RPC failed, falling back to Helius:", err);
        // 2️⃣ Fallback to Helius
        const heliusConn = new Connection(HELIUS_RPC, {
          commitment: "confirmed",
        });
        accounts = await fetchAll(heliusConn);
      }

      // Enrich with Supabase metadata
      const ids = accounts.map((c) => c.publicKey.toBase58());
      const { data: metaRows, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("id", ids);
      if (error) throw error;

      const enriched = accounts
        .map((c) => {
          const meta = metaRows?.find((m) => m.id === c.publicKey.toBase58());
          if (!meta) return null;
          return {
            publicKey: c.publicKey,
            owner: c.account.owner.toBase58(),
            amountRaised: Number(c.account.amountRaised) / 1e9,
            finalized: c.account.finalized,
            metadata: {
              ...meta,
              days_left: Number(meta.days_left),
              goal_sol: Number(meta.goal_sol),
            },
          } as Campaign;
        })
        .filter((c): c is Campaign => c !== null);
      if (active) {
        setCampaigns(enriched);
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [defaultConnection, wallet]);

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
      console.log(results);
      const currentCampaigns = results.filter(
        (c) => !isFuture(new Date(c.metadata.expiration))
      );
      setCampaigns(currentCampaigns);
    })();
    setIsLoading(false);
  }, [onChain]);

  if (isLoading)
    return (
      <div className="text-center py-12">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
          Loading <FaSpinner className="animate-spin" />
        </h1>
      </div>
    );

  return (
    <div className="bg-[#181A1F] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl text-white tracking-tight mr-auto">
            Explore Archived Campaigns
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
            <h1 className="text-2xl font-bold mb-4">No campaigns found</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
