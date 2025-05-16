export interface SupabaseCampaign {
  id: string;
  title: string;
  short_description: string;
  long_description: string;
  image_url: string;
  image_urls: string[];
  days_left: number;
  goal_sol: number;
  expiration: string;
  campaign_id: string;
  tiers: Tier[];
  socials: Socials[];
  owner: string;
  campaign_length: number;
  created_at: string;
}

export interface Tier {
  amount: number;
  title: string;
  description: string;
  nftRewardCount: number;
}

export interface Socials {
  url: string;
  platform: string
}