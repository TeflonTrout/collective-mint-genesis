"use client";
import { Backer } from "@/pages/Campaign";
import { Link } from "react-router-dom";

export default function BackersTab({ backers }: { backers: Backer[] }) {
  return (
    <div className="flex flex-col gap-2 justify-start items-start">
      {backers.length > 0 ? (
        backers.map((b) => (
          <div
            key={b.publicKey.toBase58()}
            className="flex gap-2 text-foreground "
          >
            <Link
              to={`/profile/${b.account.contributor.toBase58()}`}
              className="font-bold no-underline hover:text-muted-foreground transition-all"
            >
              {b.account.contributor.toBase58().slice(0, 5)}...
              {b.account.contributor.toBase58().slice(-5)}
            </Link>
            <span className="">
              - {b.account.amount.toNumber() / 1000000000} SOL
            </span>
          </div>
        ))
      ) : (
        <div className="text-foreground">No backers yet, be the first!</div>
      )}
    </div>
  );
}
