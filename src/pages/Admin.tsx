// /pages/admin.tsx

import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { IDL } from "@/constants/idl";
import { PROGRAM_ID as PDA_ID } from "@/constants/programID";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PROGRAM_ID = new PublicKey(PDA_ID);
const FOUNDER_KEY = new PublicKey(
  "ER95JoXGosUKuSggpW9mNNBSr6D8RrQf6H3WAE9ztuND"
); // hardcoded from Rust

export default function AdminPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [founderVaultPda, setFounderVaultPda] = useState<PublicKey | null>(
    null
  );

  const isFounder = !wallet?.publicKey?.equals(FOUNDER_KEY);

  const provider = wallet ? new AnchorProvider(connection, wallet, {}) : null;
  const program = provider ? new Program(IDL, PROGRAM_ID, provider) : null;

  // Load founder vault balance
  useEffect(() => {
    if (!wallet) return;

    (async () => {
      try {
        const [pda] = await PublicKey.findProgramAddress(
          [Buffer.from("founder_vault")],
          PROGRAM_ID
        );
        setFounderVaultPda(pda);

        const lamports = await connection.getBalance(pda);
        setBalance(lamports / 1e9); // convert to SOL
      } catch (err) {
        console.error("Error fetching vault balance", err);
        toast.error("Failed to load vault balance");
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet]);

  const handleWithdraw = async () => {
    if (!program || !wallet || !founderVaultPda) return;

    try {
      await program.methods
        .founderWithdraw()
        .accounts({
          founderVault: founderVaultPda,
          founder: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      toast.success("Withdraw successful!");
      setBalance(0);
    } catch (err) {
      console.error(err);
      toast.error("Withdraw failed: " + err.message);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-4">Founder Admin Panel</h1>

      {!wallet ? (
        <p>Please connect your wallet.</p>
      ) : !isFounder ? (
        <p className="text-red-500 font-medium">
          Access denied. Not the founder.
        </p>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <p>Loading vault balance...</p>
          ) : (
            <>
              <p className="text-lg">
                <strong>Founder Vault Balance:</strong> {balance} SOL
              </p>
              <Button
                className="bg-emerald hover:bg-emerald/90 text-white"
                onClick={handleWithdraw}
                disabled={balance === 0}
              >
                Withdraw to Founder Wallet
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
