import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doge Consulting | Product Shipping from China to USA",
  description:
    "Ship high-quality products from mainland China to the USA. Door-to-door service with competitive pricing, full customs clearance, and real-time tracking.",
  keywords: ["product shipping", "China to USA", "commodity sourcing", "international shipping", "sea freight", "Chinese manufacturing"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <I18nProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="top-right" />
        </I18nProvider>
      </body>
    </html>
  );
}
