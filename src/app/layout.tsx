import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveChat } from "@/components/layout/LiveChat";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { JsonLd, organizationSchema, websiteSchema, localBusinessSchema } from "@/components/seo/JsonLd";
import { WebVitals } from "@/components/WebVitals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://doge-consulting.com"),
  title: {
    default: "Doge Consulting | AI-Powered Product Shipping from China to USA",
    template: "%s | Doge Consulting",
  },
  description:
    "Ship high-quality products from China to the USA with AI-powered sourcing. Factory-direct pricing (save 40-60%), full customs clearance, real-time tracking, and door-to-door delivery. Free tools: CBM calculator, revenue calculator, vessel tracker.",
  keywords: ["product shipping", "China to USA", "commodity sourcing", "international shipping", "sea freight", "Chinese manufacturing", "import from China", "freight rates", "customs clearance", "Shenzhen shipping", "AI sourcing", "container shipping"],
  icons: {
    icon: "/doge-logo.png",
    shortcut: "/doge-logo.png",
    apple: "/doge-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://doge-consulting.com",
    siteName: "Doge Consulting",
    title: "Doge Consulting | AI-Powered Product Shipping from China to USA",
    description: "Ship products from China to the USA with AI-powered sourcing. Save 40-60% with factory-direct pricing. Free CBM calculator, revenue calculator, and live vessel tracker.",
    images: [
      {
        url: "/doge-logo.png",
        width: 512,
        height: 512,
        alt: "Doge Consulting Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doge Consulting | AI-Powered Product Shipping from China to USA",
    description: "Ship products from China to the USA with AI-powered sourcing. Save 40-60% with factory-direct pricing.",
    images: ["/doge-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://doge-consulting.com",
    types: {
      "application/rss+xml": "https://doge-consulting.com/feed.xml",
    },
    languages: {
      "en": "https://doge-consulting.com",
      "zh-Hans": "https://doge-consulting.com",
      "zh-Hant": "https://doge-consulting.com",
      "es": "https://doge-consulting.com",
      "fr": "https://doge-consulting.com",
      "x-default": "https://doge-consulting.com",
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Microsoft Clarity — heatmaps, session recordings, traffic insights */}
        <Script id="microsoft-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "w5qp7uku0b");
        `}</Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <JsonLd data={localBusinessSchema({
          name: "Doge Consulting — Hong Kong HQ",
          address: { street: "Rm 5, 27/F, China Resources Bldg, 26 Harbour Rd", city: "Wan Chai", region: "Hong Kong", country: "HK" },
          telephone: "+852-6151-3289",
          geo: { lat: 22.2783, lng: 114.1747 },
        })} />
        <JsonLd data={localBusinessSchema({
          name: "Doge Consulting — Seattle Office",
          address: { city: "Seattle", region: "WA", country: "US" },
          telephone: "+1-425-223-0449",
          geo: { lat: 47.6062, lng: -122.3321 },
        })} />
        <JsonLd data={localBusinessSchema({
          name: "Doge Consulting — Shenzhen Warehouse",
          address: { city: "Shenzhen", region: "Guangdong", country: "CN" },
          geo: { lat: 22.5431, lng: 114.0579 },
        })} />
        <WebVitals />
        <I18nProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" />
          <LiveChat />
        </I18nProvider>
      </body>
    </html>
  );
}
