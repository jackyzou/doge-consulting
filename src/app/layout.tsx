import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LiveChat } from "@/components/layout/LiveChat";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/seo/JsonLd";
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
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
