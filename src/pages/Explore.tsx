import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal } from "lucide-react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { IDL } from "../constants/idl.js";
import { Connection, PublicKey } from "@solana/web3.js";
import CampaignCard from "@/components/campaign/CampaignCard.js";
import { PROGRAM_ID as PDA_ID } from "../constants/programID.js";
import { supabase } from "@/lib/supabase";
import {
  addDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isFuture,
  parseISO,
} from "date-fns";
import { FaSpinner } from "react-icons/fa6";
import { SupabaseCampaign } from "@/types/supabase.js";

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
  const wallet = useAnchorWallet();
  const { connection: defaultConnection } = useConnection();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({ minRaised: "", maxDaysLeft: "" });
  const [appliedFilters, setAppliedFilters] = useState({
    minRaised: 0,
    maxDaysLeft: Infinity,
  });

  const [sortOption, setSortOption] = useState<string | null>(null);

  // click-outside to close panels
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        showFilters &&
        filterRef.current &&
        !filterRef.current.contains(e.target as Node)
      ) {
        setShowFilters(false);
      }
      if (
        showSort &&
        sortRef.current &&
        !sortRef.current.contains(e.target as Node)
      ) {
        setShowSort(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showFilters, showSort]);

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

      const enriched: Campaign[] = accounts
        .map((c) => {
          const meta = metaRows?.find((m) => m.id === c.publicKey.toBase58());
          if (!meta) return null;

          const expiration = new Date(meta.expiration);
          if (isNaN(expiration.getTime())) return null; // guard against invalid dates

          return {
            publicKey: c.publicKey,
            owner: c.account.owner.toBase58(),
            amountRaised: Number(c.account.amountRaised) / 1e9,
            finalized: c.account.finalized,
            metadata: {
              ...meta,
              days_left: Number(meta.days_left),
              goal_sol: Number(meta.goal_sol),
              expiration,
            },
          } satisfies Campaign;
        })
        .filter((c): c is Campaign => c !== null)
        .filter((c) => isFuture(c.metadata.expiration));

      if (active) {
        setCampaigns(enriched);
        setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [defaultConnection, wallet]);

  // derive displayed campaigns from raw + filters + sort
  const displayedCampaigns = useMemo(() => {
    let data = [...campaigns];
    // apply filters
    data = data.filter((c) => {
      const minutesRemaining = differenceInMinutes(
        c.metadata.expiration,
        new Date()
      );
      return (
        c.amountRaised >= appliedFilters.minRaised &&
        minutesRemaining <= appliedFilters.maxDaysLeft
      );
    });
    // apply sort
    if (sortOption === "newest") {
      data.sort((a, b) => {
        const aTime = a.metadata.created_at
          ? new Date(a.metadata.created_at).getTime()
          : 0;
        const bTime = b.metadata.created_at
          ? new Date(b.metadata.created_at).getTime()
          : 0;
        return bTime - aTime;
      });
    } else if (sortOption === "endingSoon") {
      data.sort(
        (a, b) =>
          new Date(a.metadata.expiration).getTime() -
          new Date(b.metadata.expiration).getTime()
      );
    } else if (sortOption === "mostFunded") {
      data.sort((a, b) => b.amountRaised - a.amountRaised);
    }
    return data;
  }, [campaigns, appliedFilters, sortOption]);

  if (isLoading)
    return (
      <div className="text-center py-12">
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
          Loading <FaSpinner className="animate-spin" />
        </h1>
      </div>
    );

  return (
    <div className="relative z-0 bg-[#181A1F] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-8">
          <h1 className="text-3xl md:text-4xl text-white tracking-tight mr-auto">
            Explore NFT Campaigns
          </h1>

          {/* Filters */}
          <div className="relative" ref={filterRef}>
            <Button
              variant="outline"
              onClick={() => {
                setShowFilters((f) => !f);
                setShowSort(false);
              }}
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-white hover:border-emerald transition-all shadow"
            >
              <Filter className="mr-1 h-4 w-4" /> Filters
            </Button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-64 bg-[#262830] border border-border rounded-lg shadow-lg p-4 z-10">
                <p className="text-white font-semibold mb-2">Filter by:</p>
                <label className="block">
                  <span className="text-sm text-muted-foreground">
                    Raised ≥
                  </span>
                  <input
                    type="number"
                    value={filters.minRaised}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, minRaised: e.target.value }))
                    }
                    className="w-full mt-1 p-1 rounded bg-secondary/30 text-white"
                  />
                </label>
                <label className="block mt-2">
                  <span className="text-sm text-muted-foreground">
                    Days Left ≤
                  </span>
                  <input
                    type="number"
                    value={filters.maxDaysLeft}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, maxDaysLeft: e.target.value }))
                    }
                    className="w-full mt-1 p-1 rounded bg-secondary/30 text-white"
                  />
                </label>
                <Button
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => {
                    const minR = parseFloat(filters.minRaised) || 0;
                    const maxD = parseFloat(filters.maxDaysLeft);
                    setAppliedFilters({
                      minRaised: minR,
                      maxDaysLeft: isNaN(maxD) ? Infinity : maxD,
                    });
                    setShowFilters(false);
                  }}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Sort */}
          <div className="relative" ref={sortRef}>
            <Button
              variant="outline"
              onClick={() => {
                setShowSort((s) => !s);
                setShowFilters(false);
              }}
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-white hover:border-emerald transition-all shadow"
            >
              <SlidersHorizontal className="h-4 w-4" /> Sort
            </Button>
            {showSort && (
              <div className="absolute right-0 mt-2 w-48 bg-[#262830] border border-border rounded-lg shadow-lg p-4 z-10">
                <p className="text-white font-semibold mb-2">Sort by:</p>
                <button
                  onClick={() => {
                    setSortOption("newest");
                    setShowSort(false);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-accent rounded"
                >
                  Newest
                </button>
                <button
                  onClick={() => {
                    setSortOption("endingSoon");
                    setShowSort(false);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-accent rounded"
                >
                  Ending Soon
                </button>
                <button
                  onClick={() => {
                    setSortOption("mostFunded");
                    setShowSort(false);
                  }}
                  className="block w-full text-left px-2 py-1 hover:bg-accent rounded"
                >
                  Most Funded
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campaign Grid */}
        {displayedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedCampaigns.map((c) => (
              <CampaignCard
                key={c.publicKey.toBase58()}
                id={c.publicKey.toBase58()}
                title={c.metadata.title}
                description={c.metadata.short_description}
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
            <h1 className="flex items-center justify-center gap-2 text-2xl font-bold mb-4">
              No Campaigns Found
            </h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
