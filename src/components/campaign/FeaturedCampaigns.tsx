
import React, { useState, useEffect } from 'react';
import CampaignCard from './CampaignCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Sample data for featured campaigns
const featuredCampaigns = [
  {
    id: "1",
    title: "Digital Renaissance Collection",
    description: "A series of 10 digital paintings exploring the intersection of classical art techniques and new media.",
    imageUrl: "https://images.unsplash.com/photo-1615729947596-a598e5de0ab3",
    raised: 120.5,
    goal: 200,
    daysLeft: 14,
    creator: "0x8Fc...3B6a"
  },
  {
    id: "2",
    title: "Fractal Dimension",
    description: "Procedurally generated fractal art NFTs with interactive elements that evolve over time.",
    imageUrl: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb",
    raised: 89.3,
    goal: 150,
    daysLeft: 21,
    creator: "0x2Bd...9C4c"
  },
  {
    id: "3",
    title: "Synesthesia Experience",
    description: "Music-reactive visual art pieces that capture the phenomenon of synesthesia in digital form.",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    raised: 45.8,
    goal: 100,
    daysLeft: 12,
    creator: "0x6Ae...1F7d"
  },
  {
    id: "4",
    title: "Blockchain Artifacts",
    description: "A collection exploring how digital ownership will be preserved for future generations.",
    imageUrl: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    raised: 310.2,
    goal: 500,
    daysLeft: 30,
    creator: "0x3Df...7E2b"
  },
  {
    id: "5",
    title: "Neural Network Dreams",
    description: "AI-collaborative artworks created using cutting-edge machine learning techniques.",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    raised: 78.6,
    goal: 120,
    daysLeft: 9,
    creator: "0x9Ca...4D1e"
  },
  {
    id: "6",
    title: "Metaverse Monuments",
    description: "Virtual sculptures designed for display in popular metaverse platforms.",
    imageUrl: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843",
    raised: 155.4,
    goal: 300,
    daysLeft: 18,
    creator: "0x4Ab...8F3c"
  }
];

const FeaturedCampaigns = () => {
  const [startIdx, setStartIdx] = useState(0);
  const [displayCount, setDisplayCount] = useState(3);

  const handlePrev = () => {
    setStartIdx(prev => (prev === 0 ? featuredCampaigns.length - displayCount : prev - 1));
  };

  const handleNext = () => {
    setStartIdx(prev => (prev + 1) % (featuredCampaigns.length - displayCount + 1));
  };

  // Update display count based on screen size
  useEffect(() => {
    const updateDisplayCount = () => {
      if (window.innerWidth >= 1280) {
        setDisplayCount(4);
      } else if (window.innerWidth >= 768) {
        setDisplayCount(3);
      } else if (window.innerWidth >= 640) {
        setDisplayCount(2);
      } else {
        setDisplayCount(1);
      }
    };

    updateDisplayCount();
    window.addEventListener('resize', updateDisplayCount);
    return () => window.removeEventListener('resize', updateDisplayCount);
  }, []);

  return (
    <section className="py-12">
      <div className="container px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-space font-bold">Featured Campaigns</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handlePrev}
              className="border-border hover:border-emerald hover:text-emerald"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleNext}
              className="border-border hover:border-emerald hover:text-emerald"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredCampaigns
            .slice(startIdx, startIdx + displayCount)
            .map(campaign => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                title={campaign.title}
                description={campaign.description}
                imageUrl={campaign.imageUrl}
                raised={campaign.raised}
                goal={campaign.goal}
                daysLeft={campaign.daysLeft}
                creator={campaign.creator}
              />
            ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCampaigns;
