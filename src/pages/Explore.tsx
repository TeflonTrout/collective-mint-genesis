
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@radix-ui/react-slider";
import { Filter, SlidersHorizontal, Search, ArrowUp, ArrowDown } from "lucide-react";
import classNames from "clsx";

// Mock campaign/NFT data
const categories = [
  "Art",
  "Gaming",
  "Collectible",
  "Photography",
  "Music",
  "Utility",
  "Other",
];

const mockCampaigns = [
  {
    id: "101",
    title: "Pixel Genesis",
    category: "Art",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=thumb&w=600&q=80",
    creator: "0x245...9Fb2",
    goal: 80,
    raised: 60,
    editionSize: 500,
    description: "Original pixel series, the birth of a new digital age."
  },
  {
    id: "102",
    title: "Solana Spaceships",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=thumb&w=600&q=80",
    creator: "0x12a...AB19",
    goal: 120,
    raised: 97,
    editionSize: 1500,
    description: "Spaceship NFTs for interstellar gameplay."
  },
  {
    id: "103",
    title: "Mystic Cats",
    category: "Collectible",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=thumb&w=600&q=80",
    creator: "0x9Fc...738b",
    goal: 30,
    raised: 22,
    editionSize: 100,
    description: "Hand-crafted cats with magical powers."
  },
  {
    id: "104",
    title: "Dancefloor Beats",
    category: "Music",
    image: "https://images.unsplash.com/photo-1526178613658-3ed03bc014e8?auto=format&fit=thumb&w=600&q=80",
    creator: "0x3da...db81",
    goal: 60,
    raised: 40,
    editionSize: 200,
    description: "Groovy NFTs for the music lover in you."
  },
  {
    id: "105",
    title: "PhotoScape",
    category: "Photography",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=thumb&w=600&q=80",
    creator: "0xaEd...3344",
    goal: 90,
    raised: 50,
    editionSize: 400,
    description: "A world seen through unique lenses."
  },
];

// Main filter defaults
const DEFAULT_GOAL_RANGE = [0, 200];
const DEFAULT_EDITION_RANGE = [1, 2000];

function funFont() {
  return "font-space font-bold"; // Make sure `font-space` is loaded (see tailwind config)
}

const Explore: React.FC = () => {
  // Filter state
  const [search, setSearch] = useState("");
  const [goalRange, setGoalRange] = useState<[number, number]>(DEFAULT_GOAL_RANGE);
  const [editionRange, setEditionRange] = useState<[number, number]>(DEFAULT_EDITION_RANGE);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([ ]);

  // Filter logic
  const filteredCampaigns = mockCampaigns.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(search.toLowerCase());
    const matchesGoal = camp.goal >= goalRange[0] && camp.goal <= goalRange[1];
    const matchesEdition = camp.editionSize >= editionRange[0] && camp.editionSize <= editionRange[1];
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(camp.category);
    return matchesSearch && matchesGoal && matchesEdition && matchesCategory;
  });

  // Helpers
  const handleCategoryChange = (cat: string, checked: boolean) => {
    setSelectedCategories(checked
      ? [...selectedCategories, cat]
      : selectedCategories.filter(x => x !== cat)
    );
  };

  // Sliders are basic, since we don't have a custom shadcn one exposed
  // so we'll use input type="range" with two handles

  return (
    <div className="bg-[#181A1F] min-h-[100vh] py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-4 mb-8">
          <h1 className={`text-3xl md:text-4xl ${funFont()} text-white tracking-tight mr-auto`}>
            Explore NFT Campaigns
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-black hover:border-emerald transition-all shadow"
            >
              <Filter className="mr-1 h-4 w-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              className="bg-[#262830] border border-emerald/40 text-emerald hover:bg-emerald/20 hover:text-black hover:border-emerald transition-all shadow"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="bg-[#23252b] rounded-xl p-4 mb-10 border border-[#232f27] flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Input
              type="text"
              value={search}
              placeholder="Search campaign or NFT title..."
              onChange={e => setSearch(e.target.value)}
              className="pr-10 bg-[#181A1F] border border-emerald/30 text-white placeholder:text-emerald/40 focus:border-emerald focus:ring-emerald transition"
            />
            <Search className="absolute right-2 top-2 h-5 w-5 text-emerald/60 pointer-events-none" />
          </div>
          {/* Goal Range */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-muted-foreground">SOL Goal</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={DEFAULT_GOAL_RANGE[0]}
                max={DEFAULT_GOAL_RANGE[1]}
                value={goalRange[0]}
                onChange={e =>
                  setGoalRange([+e.target.value, Math.max(goalRange[1], +e.target.value + 1)])
                }
                className="range-thumb-emerald"
              />
              <input
                type="range"
                min={DEFAULT_GOAL_RANGE[0]}
                max={DEFAULT_GOAL_RANGE[1]}
                value={goalRange[1]}
                onChange={e =>
                  setGoalRange([Math.min(goalRange[0], +e.target.value - 1), +e.target.value])
                }
                className="range-thumb-emerald"
              />
              <span className="ml-2 text-emerald">{goalRange[0]} - {goalRange[1]} SOL</span>
            </div>
          </div>
          {/* Category Filter */}
          <div>
            <span className="text-sm text-muted-foreground mb-1 block">Category</span>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <label
                  key={cat}
                  className={classNames(
                    "flex items-center space-x-1.5 px-2 py-1 rounded-lg cursor-pointer text-xs font-medium bg-[#23292c] border border-transparent hover:border-emerald transition-all",
                    selectedCategories.includes(cat) && "bg-emerald/80 text-black"
                  )}
                >
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={val => handleCategoryChange(cat, !!val)}
                    className="accent-emerald"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Edition Size Filter */}
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-muted-foreground">Edition Size</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={DEFAULT_EDITION_RANGE[0]}
                max={DEFAULT_EDITION_RANGE[1]}
                value={editionRange[0]}
                onChange={e =>
                  setEditionRange([+e.target.value, Math.max(editionRange[1], +e.target.value + 1)])
                }
                className="range-thumb-emerald"
              />
              <input
                type="range"
                min={DEFAULT_EDITION_RANGE[0]}
                max={DEFAULT_EDITION_RANGE[1]}
                value={editionRange[1]}
                onChange={e =>
                  setEditionRange([Math.min(editionRange[0], +e.target.value - 1), +e.target.value])
                }
                className="range-thumb-emerald"
              />
              <span className="ml-2 text-emerald">{editionRange[0]} - {editionRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredCampaigns.length === 0 && (
            <div className="col-span-full text-center text-emerald/90 py-8">
              <span>No campaigns found matching filters.</span>
            </div>
          )}
          {filteredCampaigns.map(camp => (
            <div
              key={camp.id}
              className={classNames(
                "group relative bg-[#222428] rounded-xl overflow-hidden border border-[#313531] hover:border-emerald/40 transition-all duration-300 shadow-lg",
                "hover:scale-105 hover:shadow-emerald/40",
                "cursor-pointer"
              )}
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={camp.image}
                  alt={camp.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#181A1F] via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h2 className={`${funFont()} text-lg truncate group-hover:text-emerald transition`}>{camp.title}</h2>
                  <Badge variant="outline"
                    className="text-xs bg-[#233833] text-emerald border-emerald/30 px-2">{camp.category}</Badge>
                </div>
                <div className="text-muted-foreground text-xs truncate mb-1">{camp.creator}</div>
                <div className="flex items-center text-xs text-white gap-2">
                  <span>
                    <span className="text-emerald font-semibold">{camp.raised} / {camp.goal} SOL</span>
                  </span>
                  <span className="mx-1 text-[#434b44]">•</span>
                  <span>Edition: <span className="text-emerald">{camp.editionSize}</span></span>
                </div>
                <div className="text-xs text-[#bbb] line-clamp-2">{camp.description}</div>
              </div>
              {/* Emerald glow effect */}
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-90 transition duration-500"
                style={{
                  boxShadow: "0 0 34px 12px #2ECC71cc, 0 0 12px 2px #2ECC7177"
                }} />
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
          .range-thumb-emerald::-webkit-slider-thumb {
            background: #2ECC71;
            border-radius: 99px;
            box-shadow: 0 0 6px 2px #2ECC71;
          }
          .range-thumb-emerald::-moz-range-thumb {
            background: #2ECC71;
            border-radius: 99px;
            box-shadow: 0 0 6px 2px #2ECC71;
          }
          .range-thumb-emerald::-ms-thumb {
            background: #2ECC71;
            border-radius: 99px;
            box-shadow: 0 0 6px 2px #2ECC71;
          }
        `}
      </style>
    </div>
  );
};

export default Explore;
