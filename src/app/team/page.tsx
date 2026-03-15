import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Our Team — Industry Experts in China-to-USA Trade",
  description: "Meet the Doge Consulting team: logistics experts, trade analysts, and technology specialists with decades of experience in China-to-USA import/export operations.",
  openGraph: {
    title: "Our Team | Doge Consulting",
    description: "Meet our experts in China-USA trade, logistics, and technology.",
    url: "https://doge-consulting.com/team",
  },
  alternates: { canonical: "https://doge-consulting.com/team" },
};

const team = [
  {
    name: "Jacky Zou",
    role: "CEO & Founder",
    slug: "jacky-zou",
    image: "JZ",
    color: "#2EC4B6",
    bio: "Serial entrepreneur with deep expertise in cross-border e-commerce and US-China trade. Founded Doge Consulting to make factory-direct importing accessible to small and medium businesses. Based in Seattle, WA with operations in Hong Kong and Shenzhen.",
    expertise: ["Cross-Border E-Commerce", "US-China Trade", "Business Strategy", "Product Sourcing", "Supply Chain"],
    linkedin: "https://linkedin.com/in/jackyzou",
  },
  {
    name: "Seto Nakamura",
    role: "Editor-in-Chief & Trade Analyst",
    slug: "seto-nakamura",
    image: "SN",
    color: "#7C3AED",
    bio: "10 years in international trade journalism and PR. Former correspondent covering Asia-Pacific shipping routes, tariff policy, and supply chain disruptions. Writes data-driven analysis on freight rates, trade policy, and market opportunities for US importers.",
    expertise: ["Trade Policy Analysis", "Freight Rate Intelligence", "Import/Export Regulations", "Tariff Strategy", "Industry Research"],
  },
  {
    name: "Seth Parker",
    role: "Chief Technology Officer",
    slug: "seth-parker",
    image: "SP",
    color: "#2563EB",
    bio: "12 years in full-stack engineering, DevOps, and cloud infrastructure. Built Doge Consulting's technology platform including 8 free import tools, real-time vessel tracking, and AI product matching. Specializes in SEO-optimized web applications and data-driven logistics technology.",
    expertise: ["Web Development", "DevOps", "SEO Technical", "Database Architecture", "Logistics Technology"],
  },
  {
    name: "Rachel Morales",
    role: "Chief Marketing Officer",
    slug: "rachel-morales",
    image: "RM",
    color: "#D97706",
    bio: "14 years in digital marketing across B2B and B2C international brands. Leads Doge Consulting's content strategy, SEO, and community growth. Expert in channel optimization for bootstrapped companies targeting niche B2B audiences.",
    expertise: ["SEO Strategy", "Content Marketing", "B2B Growth", "Community Building", "Conversion Optimization"],
  },
];

export default function TeamPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([
        { name: "Home", url: "https://doge-consulting.com" },
        { name: "Team", url: "https://doge-consulting.com/team" },
      ])} />
      {/* Author structured data for each team member */}
      {team.map(member => (
        <JsonLd key={member.slug} data={{
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": `https://doge-consulting.com/team#${member.slug}`,
          name: member.name,
          jobTitle: member.role,
          url: `https://doge-consulting.com/team#${member.slug}`,
          worksFor: { "@type": "Organization", name: "Doge Consulting Group Limited" },
          knowsAbout: member.expertise,
          ...(member.linkedin && { sameAs: [member.linkedin] }),
        }} />
      ))}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <section className="gradient-hero py-16 text-white">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Our Team</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Industry experts in China-to-USA trade, logistics technology, and market intelligence.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <div className="grid gap-8 sm:grid-cols-2">
            {team.map(member => (
              <div key={member.slug} id={member.slug} className="rounded-xl border bg-white p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full text-white text-xl font-bold flex items-center justify-center shrink-0 shadow-md" style={{ background: member.color }}>
                    {member.image}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-navy">{member.name}</h2>
                    <p className="text-sm text-teal font-semibold">{member.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {member.expertise.map(e => (
                    <span key={e} className="text-[11px] bg-muted px-2 py-0.5 rounded-full">{e}</span>
                  ))}
                </div>
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal mt-3 hover:underline">
                    LinkedIn Profile →
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
            <h2 className="text-2xl font-bold mb-3">Work With Our Team</h2>
            <p className="text-muted-foreground mb-6">Get a free consultation with our import specialists.</p>
            <Link href="/quote" className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-3 text-white font-semibold hover:bg-teal/90 transition-colors">
              Get a Free Quote →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
