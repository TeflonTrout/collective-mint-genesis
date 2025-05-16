import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

const Navbar = () => {
  const wallet = useAnchorWallet();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="py-4 px-4 relative md:px-8 w-full bg-charcoal/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center justify-center">
            <img
              src="/CM.png"
              alt="CollectiveMint"
              className="w-10 h-10 mr-1 -mt-2"
            />
            <span className="text-white text-xl font-space font-bold">
              Collective
            </span>
            <span className="text-emerald text-xl font-space font-bold">
              Mint
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link
            to="/explore"
            className="text-foreground hover:text-emerald transition-colors"
          >
            Explore
          </Link>
          <Link
            to="/create"
            className="text-foreground hover:text-emerald transition-colors"
          >
            Create
          </Link>
          <Link
            to="/archive"
            className="text-foreground hover:text-emerald transition-colors"
          >
            Archive
          </Link>
          <Link
            to="/docs"
            className="text-foreground hover:text-emerald transition-colors"
          >
            Docs
          </Link>
          <Link
            to="/about"
            className="text-foreground hover:text-emerald transition-colors"
          >
            About
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <div className="bg-secondary rounded-full px-3 py-1 text-xs text-muted-foreground">
            Devnet
          </div>
          <div className="neon-glow hover:bg-emerald/10">
            <WalletMultiButton
              style={{
                background: "transparent",
                color: "#2ecc71",
                border: "2px solid #2ecc71",
              }}
            />
          </div>
          {wallet && (
            <Link
              to={`/profile/${wallet?.publicKey}`}
              className="text-foreground hover:text-emerald transition-colors"
            >
              My Profile
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-emerald"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-charcoal border-b border-border shadow-lg z-40">
          <div className="px-4 py-4 space-y-3">
            <Link
              to="/"
              className="block py-2 text-foreground hover:text-emerald"
              onClick={() => setIsOpen(false)}
            >
              Explore
            </Link>
            <Link
              to="/create"
              className="block py-2 text-foreground hover:text-emerald"
              onClick={() => setIsOpen(false)}
            >
              Create
            </Link>
            <Link
              to="/docs"
              className="block py-2 text-foreground hover:text-emerald"
              onClick={() => setIsOpen(false)}
            >
              Docs
            </Link>
            <Link
              to="/about"
              className="block py-2 text-foreground hover:text-emerald"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <div className="pt-2 pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-secondary rounded-full px-3 py-1 text-xs text-muted-foreground">
                  Devnet
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="neon-glow text-emerald border-emerald hover:bg-emerald/10"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
