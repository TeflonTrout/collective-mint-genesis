import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedCampaigns from "@/components/campaign/FeaturedCampaigns";
import HowItWorks from "@/components/home/HowItWorks";

const Index = () => {
  return (
    <div className="min-h-screen bg-charcoal text-foreground flex flex-col">
      <main className="flex-grow">
        <HeroSection />
        <FeaturedCampaigns />
        <HowItWorks />
      </main>
    </div>
  );
};

export default Index;
