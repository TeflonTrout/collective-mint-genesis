// src/components/campaign/Heading.tsx
import { Link } from "react-router-dom";
import {
  FaDiscord,
  FaGlobe,
  FaInstagram,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";
import Rating from "./Rating";
import { SupabaseCampaign } from "@/types/supabase";
import type { Rating as CampaignRating } from "@/pages/Campaign";

interface OnChainData {
  amountRaised: number;
  goal: number;
  owner: string;
  deadline: number;
  finalized: boolean;
}

interface HeadingProps {
  meta: SupabaseCampaign;
  onChain: OnChainData;
  ratings: CampaignRating[];
  reviewCount: number; // e.g. 12
}

export default function Heading({
  meta,
  onChain,
  ratings,
  reviewCount,
}: HeadingProps) {
  const socialPlatformSwitch = (platform: string) => {
    switch (platform) {
      case "x":
        return <FaXTwitter />;
      case "website":
        return <FaGlobe />;
      case "discord":
        return <FaDiscord />;
      case "instagram":
        return <FaInstagram />;
      case "telegram":
        return <FaTelegram />;
    }
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[auto,1fr] md:grid-rows-2 items-center mb-4"
      style={{ gridTemplateRows: "1fr, 1fr" }}
    >
      <img
        src={meta.image_url}
        alt={meta.title}
        className=" row-span-1 md:row-span-2 w-16 h-16 mr-4 rounded-full object-cover justify-self-center"
      />

      {/* Row 1: Title | Rating | Reviews | Socials */}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="flex-1 min-w-0 text-2xl font-bold text-foreground truncate">
          {meta.title}
        </h1>

        {ratings.length > 0 && (
          <div className="flex items-center space-x-2">
            <Rating
              score={ratings.reduce((acc, rating) => acc + rating.score, 0)}
            />
            <span className="text-sm text-muted-foreground">
              ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex space-x-2 text-xl text-muted-foreground">
          {meta.socials.map((social) => (
            <Link
              key={social.platform}
              to={social.url}
              target="_blank"
              rel="noopener"
              className="text-center flex items-center justify-center hover:text-foreground transition-all"
            >
              <span className="text-2xl">
                {socialPlatformSwitch(social.platform)}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Row 2: “By {owner}” */}
      <div className="row-span-1 flex items-center space-x-2 text-sm text-muted-foreground">
        <span>By</span>
        <Link
          to={`/profile/${onChain.owner}`}
          className="font-semibold text-foreground hover:underline truncate"
        >
          {onChain.owner.slice(0, 5)}…{onChain.owner.slice(-5)}
        </Link>
      </div>
    </div>
  );
}
