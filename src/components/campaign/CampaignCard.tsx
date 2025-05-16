import React from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import {
  differenceInHours,
  formatDistanceToNowStrict,
  isFuture,
} from "date-fns";

interface CampaignCardProps {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  imageUrl: string;
  raised: number;
  goal: number;
  daysLeft: number;
  expiration: string;
  creator: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  id,
  campaignId,
  title,
  description,
  imageUrl,
  raised,
  goal,
  daysLeft,
  expiration,
  creator,
}) => {
  const percentFunded = Math.min((raised / goal) * 100, 100);
  const isExpired = !isFuture(new Date(expiration));

  return (
    <Link to={`/campaign/${campaignId}`} className="block z-0">
      <div className="relative bg-card rounded-xl overflow-hidden border border-border hover:border-emerald/30 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald/10">
        {/* Ribbon */}
        {isExpired && (
          <div className="absolute top-2 right-2 bg-red-600/80 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
            Expired
          </div>
        )}
        {percentFunded === 100 && isExpired && (
          <div className="absolute top-2 left-2 bg-emerald text-white text-xs font-bold px-2 py-1 rounded-full z-20">
            100% Funded
          </div>
        )}
        {!isExpired &&
          differenceInHours(new Date(expiration), new Date()) < 24 &&
          percentFunded < 100 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
              24h Left!
            </div>
          )}
        {percentFunded === 0 && !isExpired && (
          <div className="absolute top-2 left-2 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full z-20">
            Could use some help!
          </div>
        )}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0
              ${isExpired ? "grayscale " : ""}
              `}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        </div>

        <div className="p-5 space-y-4">
          <h3
            className={`font-space text-xl font-bold line-clamp-1 group-hover:text-emerald transition-colors ${
              percentFunded === 100 ? "text-emerald" : ""
            }`}
          >
            {title}
          </h3>

          <p className="text-muted-foreground text-sm truncate text-ellipsis">
            {description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{raised.toFixed(2)} SOL raised</span>
              <span className="font-medium">{percentFunded.toFixed(1)}%</span>
            </div>
            <Progress value={percentFunded} className="h-2 bg-secondary" />
          </div>

          <div className="flex justify-between items-center">
            {isFuture(new Date(expiration)) ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {expiration &&
                    formatDistanceToNowStrict(new Date(expiration))}{" "}
                  left
                </span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Expired</span>
              </div>
            )}
            <div
              className="text-sm text-muted-foreground truncate max-w-[120px]"
              title={creator}
            >
              by {creator}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
