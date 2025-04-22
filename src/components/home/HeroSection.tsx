
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="pt-32 pb-20 relative overflow-hidden">
      {/* Abstract animated background */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2ECC71" />
              <stop offset="100%" stopColor="#21936f" />
            </linearGradient>
          </defs>
          <g fill="none" strokeWidth="2" stroke="url(#a)">
            {Array.from({ length: 10 }).map((_, i) => (
              <path
                key={i}
                d={`M${Math.random() * 1000} ${Math.random() * 1000} 
                   Q${Math.random() * 1000} ${Math.random() * 1000}, 
                   ${Math.random() * 1000} ${Math.random() * 1000} 
                   T${Math.random() * 1000} ${Math.random() * 1000}`}
                opacity={0.1 + Math.random() * 0.3}
              >
                <animate
                  attributeName="d"
                  dur={`${20 + Math.random() * 30}s`}
                  repeatCount="indefinite"
                  values={`
                    M${Math.random() * 1000} ${Math.random() * 1000} 
                    Q${Math.random() * 1000} ${Math.random() * 1000}, 
                    ${Math.random() * 1000} ${Math.random() * 1000} 
                    T${Math.random() * 1000} ${Math.random() * 1000};
                    
                    M${Math.random() * 1000} ${Math.random() * 1000} 
                    Q${Math.random() * 1000} ${Math.random() * 1000}, 
                    ${Math.random() * 1000} ${Math.random() * 1000} 
                    T${Math.random() * 1000} ${Math.random() * 1000};
                    
                    M${Math.random() * 1000} ${Math.random() * 1000} 
                    Q${Math.random() * 1000} ${Math.random() * 1000}, 
                    ${Math.random() * 1000} ${Math.random() * 1000} 
                    T${Math.random() * 1000} ${Math.random() * 1000}`}
                />
              </path>
            ))}
          </g>
        </svg>
      </div>

      <div className="container px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-space font-bold tracking-tight">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Fund the Next Wave of
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald to-emerald/80 bg-clip-text text-transparent animate-pulse-glow inline-block">
              Digital Art
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
            CollectiveMint helps creators raise funds for digital art projects through community backing. Launch your NFT campaign today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button size="lg" className="bg-emerald hover:bg-emerald/90 text-black font-medium neon-glow">
              <Link to="/explore" className="flex items-center">
                Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-emerald text-emerald hover:bg-emerald/10 neon-glow">
              <Link to="/create">Start Your Campaign</Link>
            </Button>
          </div>
          
          <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-space font-bold text-emerald">100+</span>
              <span>Funded Projects</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-space font-bold text-emerald">10,000+</span>
              <span>Community Members</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-space font-bold text-emerald">500K</span>
              <span>SOL Raised</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
