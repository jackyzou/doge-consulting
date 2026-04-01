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
    name: "Alex Chen",
    role: "CEO & Co-Founder",
    slug: "alex-chen",
    image: "/team/alex-chen.svg",
    color: "#0F2B46",
    bio: "20+ years scaling import/export and technology businesses from zero to multi-million dollar revenue. Leads Doge Consulting's strategy, operations, and team coordination. Previously built cross-border supply chains for major US retailers. Based in Seattle with operations in Hong Kong and Shenzhen.",
    expertise: ["Business Strategy", "Cross-Border Trade", "Operations Management", "Revenue Growth", "Team Leadership"],
  },
  {
    name: "Amy Lin",
    role: "Chief Financial Officer",
    slug: "amy-lin",
    image: "/team/amy-lin.svg",
    color: "#059669",
    bio: "15 years in finance, SMB accounting, and international trade finance. Manages pricing strategy, cash flow, and financial reporting. Expert in US-China trade finance structures and tariff optimization for importers.",
    expertise: ["Financial Planning", "Pricing Strategy", "Tax Optimization", "Trade Finance", "Cash Flow Management"],
  },
  {
    name: "Seth Parker",
    role: "Chief Technology Officer",
    slug: "seth-parker",
    image: "/team/seth-parker.svg",
    color: "#2563EB",
    bio: "12 years in full-stack engineering, DevOps, and cloud infrastructure. Built Doge Consulting's technology platform including 8 free import tools, real-time vessel tracking, and AI product matching. Specializes in SEO-optimized web applications and data-driven logistics technology.",
    expertise: ["Web Development", "DevOps", "SEO Technical", "Database Architecture", "Logistics Technology"],
  },
  {
    name: "Rachel Morales",
    role: "Chief Marketing Officer",
    slug: "rachel-morales",
    image: "/team/rachel-morales.svg",
    color: "#D97706",
    bio: "14 years in digital marketing across B2B and B2C international brands. Leads Doge Consulting's content strategy, SEO, and community growth. Expert in channel optimization for bootstrapped companies targeting niche B2B audiences.",
    expertise: ["SEO Strategy", "Content Marketing", "B2B Growth", "Community Building", "Conversion Optimization"],
  },
  {
    name: "Seto Nakamura",
    role: "Editor-in-Chief & Trade Analyst",
    slug: "seto-nakamura",
    image: "/team/seto-nakamura.svg",
    color: "#7C3AED",
    bio: "10 years in international trade journalism and PR. Former correspondent covering Asia-Pacific shipping routes, tariff policy, and supply chain disruptions. Writes data-driven analysis on freight rates, trade policy, and market opportunities for US importers.",
    expertise: ["Trade Policy Analysis", "Freight Rate Intelligence", "Import/Export Regulations", "Tariff Strategy", "Industry Research"],
  },
  {
    name: "Tiffany Wang",
    role: "Customer Service Officer",
    slug: "tiffany-wang",
    image: "/team/tiffany-wang.svg",
    color: "#EC4899",
    bio: "8 years in customer success, e-commerce operations, and order management. Fluent in English and Mandarin Chinese. First point of contact for all customer inquiries, manages quotes, orders, and ongoing customer relationships.",
    expertise: ["Customer Support", "Order Management", "CRM", "Bilingual EN/ZH", "E-Commerce Operations"],
  },
  {
    name: "Kim Park",
    role: "UI/UX Designer",
    slug: "kim-park",
    image: "/team/kim-park.svg",
    color: "#8B5CF6",
    bio: "10 years in UI/UX design, brand systems, and conversion optimization. Owns Doge Consulting's visual identity, component library, and accessibility compliance. Specializes in data-dense interfaces for logistics and trade tools.",
    expertise: ["UI Design", "UX Research", "Brand Systems", "Accessibility", "Conversion Optimization", "Design Systems"],
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
          image: `https://doge-consulting.com${member.image}`,
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
                  <img src={member.image} alt={member.name} className="w-16 h-16 rounded-full object-cover shrink-0 shadow-md border-2" style={{ borderColor: member.color }} />
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
