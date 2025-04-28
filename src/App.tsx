// App.tsx
import { useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
import About from "./pages/About";
import Docs from "./pages/Docs";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";

// Solana wallet imports
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

// Pull in the default styles for the modal (only needs to be imported once)
import "@solana/wallet-adapter-react-ui/styles.css";
import Navbar from "./components/layout/Navbar";
import Campaign from "./pages/Campaign";
import Profile from "./pages/Profile";

const network = "https://api.devnet.solana.com";

const queryClient = new QueryClient();

const App = () => {
  // 1) Configure the wallets you want to support
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={network}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/docs" element={<Docs />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/campaign/:campaignId" element={<Campaign />} />
                  <Route
                    path="/profile/:walletPublicKey"
                    element={<Profile />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
};

export default App;
