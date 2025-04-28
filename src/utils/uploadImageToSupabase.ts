import { supabase } from "@/lib/supabase";

async function uploadCampaignImage(file: File, campaignId: string) {
  const { data, error } = await supabase.storage
    .from("campaign-images")
    .upload(`campaign-${campaignId}/${file.name}`, file);

  if (error) {
    throw error;
  }

  const { data: publicUrl } = supabase.storage
    .from("campaign-images")
    .getPublicUrl(`campaign-${campaignId}/${file.name}`);

  return publicUrl.publicUrl; // Save this in your metadata table!
}

export default uploadCampaignImage;