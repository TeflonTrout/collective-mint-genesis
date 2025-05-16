export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100 space-y-6">
      <h1 className="text-4xl font-bold text-center text-emerald">
        CollectiveMint Documentation
      </h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">1. How It Works</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Creators launch NFT campaigns with a funding goal and deadline.
          </li>
          <li>Supporters pledge SOL to back a campaign.</li>
          <li>All funds are locked in a smart contract on Solana Devnet.</li>
          <li>
            If the goal is reached: NFTs are minted and funds go to the creator.
          </li>
          <li>
            If the goal is not reached: all funds are automatically refunded to
            supporters.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">2. Tech Stack</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Frontend:</strong> Next.js, Tailwind CSS, TypeScript
          </li>
          <li>
            <strong>Wallet:</strong> Solana Wallet Adapter
          </li>
          <li>
            <strong>Contracts:</strong> Anchor (Solana Devnet)
          </li>
          <li>
            <strong>Token Standards:</strong> SPL Tokens + Metaplex NFTs
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">3. Demo Campaigns</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>🎯 Fully funded campaign (mints NFTs on success)</li>
          <li>❌ Underfunded campaign (refunds SOL to backers)</li>
          <li>⌛ Campaign in progress (still collecting pledges)</li>
          <li>🖼️ NFT preview metadata & campaign previews</li>
        </ul>
        <p className="mt-2">
          You can view and interact with live Devnet campaigns at:{" "}
          <a
            href="https://collective-mint.vercel.app"
            className="text-blue-400 underline"
            target="_blank"
          >
            collective-mint.vercel.app
          </a>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">4. Solana Program Logic</h2>
        <p>
          All logic is handled through Anchor smart contracts deployed to Solana
          Devnet. Funds are stored using PDAs and automatically distributed
          based on funding success or failure.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">5. Future Features</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>🏆 Tiered reward levels</li>
          <li>🧑 Creator profile pages</li>
          <li>🧭 Campaign discovery and filtering</li>
          <li>🌉 Cross-chain compatibility (Ethereum, Base, etc.)</li>
          <li>🗳️ Governance tools for backers</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">6. Project Links</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <a
              href="https://github.com/TeflonTrout/collective-mint-genesis"
              className="underline text-blue-400"
              target="_blank"
            >
              GitHub Repository
            </a>
          </li>
          <li>
            <a
              href="https://collective-mint.vercel.app"
              className="underline text-blue-400"
              target="_blank"
            >
              Live Demo
            </a>
          </li>
          <li>
            <a
              href="https://YOUR_DEMO_VIDEO_LINK"
              className="underline text-blue-400"
              target="_blank"
            >
              Demo Video
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
