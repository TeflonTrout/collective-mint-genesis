# 🧱 CollectiveMint

**CollectiveMint** is a decentralized crowdfunding platform for NFT and Web3 projects, built on **Solana**.  
It uses an **all-or-nothing smart contract model**, so creators only receive funds if their campaign meets its goal. Otherwise, backers are automatically refunded — no risk, no rugs.

---

## 🚀 Live Demo

- 🌐 [Live App](https://collective-mint.vercel.app)
- 🎥 [Demo Video](https://your-demo-video-link.com)

---

## 🔧 How It Works

1. **Creators** launch campaigns with:
   - NFT metadata (images, supply, etc.)
   - Funding goal in SOL
   - Deadline (time-based expiration)

2. **Supporters** back the campaign by pledging SOL.

3. If the campaign **meets its goal**:
   - NFTs are minted to backers.
   - SOL is released to the creator.

4. If the campaign **fails**:
   - All funds are automatically refunded to backers.
   - Nothing is minted. No one loses.

---

## 🧪 Test Campaigns

You can interact with live Devnet campaigns:
- ✅ Fully funded — shows successful minting.
- ❌ Underfunded — shows refunding behavior.
- ⌛ In progress — shows active campaign with countdown.

Try funding, minting, and refunding on Devnet via the live app.

---

## 🛠️ Tech Stack

| Layer        | Tech                             |
|--------------|----------------------------------|
| Frontend     | Next.js, Tailwind CSS, TypeScript |
| Wallet       | Solana Wallet Adapter (Phantom, etc.) |
| Smart Contract | Solana + Anchor Framework       |
| Token Standard | SPL Tokens + Metaplex NFTs     |
| Hosting      | Vercel + Solana Devnet           |

---

## 📄 Smart Contracts

- All funding logic is handled on-chain via **Anchor**.
- Uses **PDAs (Program Derived Addresses)** for campaign escrow.
- Mint gating and refunding logic is 100% decentralized.

You can view and interact with the contracts on Devnet.

---

## 🧭 Roadmap (Post-MVP)

- 🏆 Tiered reward levels
- 🧑 Creator profile dashboards
- 🧭 Campaign discovery filters (by category/status)
- 🌉 Cross-chain support (Ethereum, Base)
- 🗳️ DAO-like voting for backer governance

---

## 📜 License

MIT License © 2025 CollectiveMint
