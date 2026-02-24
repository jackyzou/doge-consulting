import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { PricingOverview } from "@/components/home/PricingOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQPreview } from "@/components/home/FAQPreview";
import { CTABanner } from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <ServicesOverview />
      <PricingOverview />
      <Testimonials />
      <FAQPreview />
      <CTABanner />
    </>
  );
}
