import React from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { formatDistanceToNowStrict, isFuture } from "date-fns";

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

  return (
    <Link to={`/campaign/${campaignId}`}>
      <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-emerald/30 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald/10">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
        </div>

        <div className="p-5 space-y-4">
          <h3 className="font-space text-xl font-bold line-clamp-1 group-hover:text-emerald transition-colors">
            {title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{raised.toFixed(2)} SOL raised</span>
              <span className="font-medium">{percentFunded.toFixed(0)}%</span>
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
