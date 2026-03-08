import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { PricingOverview } from "@/components/home/PricingOverview";
import { Testimonials } from "@/components/home/Testimonials";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FAQPreview } from "@/components/home/FAQPreview";
import { CTABanner } from "@/components/home/CTABanner";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <ServicesOverview />
      <PricingOverview />
      <Testimonials />
      <NewsletterSection />
      <FAQPreview />
      <CTABanner />
      {/* App Description + Privacy — visible without login, satisfies Google OAuth requirements */}
      <section className="bg-slate-50 border-t py-12">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-lg font-semibold text-navy mb-3">About Doge Consulting</h2>
          <p className="text-sm text-muted-foreground max-w-3xl mx-auto mb-4">
            Doge Consulting is a product sourcing and shipping platform that helps businesses and consumers
            import goods from China to the USA. Our app lets you get instant shipping quotes, track shipments in
            real-time, manage orders, and access import tools like duty calculators and CBM calculators.
            When you sign in with Google, we only access your name, email, and profile picture to create your account.
            We never access your contacts, calendar, or any other Google services.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="underline hover:text-teal transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/about" className="underline hover:text-teal transition-colors">About Us</Link>
            <span>·</span>
            <Link href="/contact" className="underline hover:text-teal transition-colors">Contact</Link>
            <span>·</span>
            <Link href="/faq" className="underline hover:text-teal transition-colors">FAQ</Link>
          </div>
        </div>
      </section>
    </>
  );
}
