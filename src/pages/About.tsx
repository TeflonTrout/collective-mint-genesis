export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 text-gray-100 space-y-6">
      <h1 className="text-4xl font-bold text-center text-emerald">
        About CollectiveMint
      </h1>

      <section>
        <h2 className="text-2xl font-semibold mb-2">What is CollectiveMint?</h2>
        <p>
          <strong>CollectiveMint</strong> is a decentralized crowdfunding
          platform for NFT and Web3 projects, powered by Solana. We give
          creators a safer, smarter way to launch NFT collections and allow
          backers to support them with real confidence.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Why It Matters</h2>
        <p>
          Most NFT mints today require users to blindly send funds with no
          guarantee of delivery or value. This creates a trust gap — and often
          leads to failed mints, rug pulls, or underwhelming drops.
        </p>
        <p className="mt-2">
          CollectiveMint flips that model with an{" "}
          <strong>all-or-nothing funding system</strong>. Creators only receive
          funds if their project hits its goal. If not, all funds are
          automatically refunded — no middlemen, no risk.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">How We’re Different</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Smart Contract Escrow:</strong> Funds are locked until
            funding success is confirmed.
          </li>
          <li>
            <strong>Mint Gating:</strong> NFTs only mint when the community hits
            the goal.
          </li>
          <li>
            <strong>Solana Devnet:</strong> Fast, low-fee test network with
            on-chain logic.
          </li>
          <li>
            <strong>No Gatekeeping:</strong> Anyone can launch a project or
            support one — no permission needed.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Who It’s For</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Artists & Creators:</strong> Launch your NFT project without
            needing VC funding or a massive following.
          </li>
          <li>
            <strong>Collectors:</strong> Support the projects you believe in —
            and only mint when goals are met.
          </li>
          <li>
            <strong>Builders & Developers:</strong> Use CollectiveMint as a
            launchpad for Web3 MVPs.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Our Vision</h2>
        <p>
          We believe in a future where NFT funding is transparent, secure, and
          community-first. CollectiveMint is building the rails for that future
          — one project at a time.
        </p>
      </section>
    </div>
  );
}
