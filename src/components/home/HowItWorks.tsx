
import React from 'react';
import { Check } from 'lucide-react';

const steps = [
  {
    title: "Create Your Campaign",
    description: "Set up your project with artwork, funding goal, and campaign duration in minutes.",
  },
  {
    title: "Share & Build Community",
    description: "Share your campaign with your audience and build a community of supporters.",
  },
  {
    title: "Get Funded",
    description: "Backers contribute SOL to help you reach your funding goal.",
  },
  {
    title: "Deliver Rewards",
    description: "When funded, deliver NFTs and other rewards to your backers automatically.",
  }
];

const features = [
  "No fees if project doesn't meet funding goal",
  "Smart contract-powered escrow system",
  "Automated NFT distribution to backers",
  "Customizable campaign pages",
  "Built on Solana for fast, low-cost transactions",
  "Community governance and voting",
];

const HowItWorks = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-space font-bold">How CollectiveMint Works</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            A simple, transparent process to bring your digital art to life through community funding
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="bg-card p-6 rounded-xl border border-border relative"
            >
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-emerald text-black font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <h3 className="text-xl font-space font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-card rounded-xl p-8 border border-border">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-space font-bold mb-4">Platform Features</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mt-1 mr-2 h-5 w-5 rounded-full bg-emerald/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-emerald" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-charcoal rounded-lg p-6 border border-border">
              <h4 className="font-space font-bold mb-4 text-emerald">Ready to Get Started?</h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Join creators who have successfully funded their projects and built dedicated communities around their art.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Average funding rate</span>
                  <span className="font-medium text-emerald">68%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full">
                  <div className="h-full w-[68%] bg-emerald rounded-full"></div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  *Based on projects that meet our curation criteria
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
