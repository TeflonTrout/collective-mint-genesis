
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-charcoal border-t border-border text-foreground py-12">
      <div className="container px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <span className="text-white text-xl font-space font-bold">Collective</span>
              <span className="text-emerald text-xl font-space font-bold">Mint</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              A decentralized crowdfunding platform for digital art projects built on Solana.
            </p>
            <div className="flex space-x-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald transition-colors">
                Twitter
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald transition-colors">
                Discord
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald transition-colors">
                GitHub
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-space font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/explore" className="text-muted-foreground hover:text-emerald transition-colors">
                  Explore Campaigns
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-muted-foreground hover:text-emerald transition-colors">
                  Start a Campaign
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-emerald transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-muted-foreground hover:text-emerald transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-space font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-emerald transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-emerald transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-emerald transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-emerald transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-space font-bold mb-4">Stay Updated</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Join our newsletter to get updates on new features, projects, and community events.
            </p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 rounded-lg bg-secondary text-foreground border border-border focus:border-emerald focus:outline-none focus:ring-1 focus:ring-emerald"
              />
              <button 
                type="submit" 
                className="w-full py-2 rounded-lg bg-emerald text-black font-medium hover:bg-emerald/90 transition-colors neon-glow"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} CollectiveMint. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-2 md:mt-0">
            Built with ❤️ for the Solana community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
