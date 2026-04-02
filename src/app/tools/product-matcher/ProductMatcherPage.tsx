"use client";

import { Sparkles, Package, DollarSign, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProductMatcherV2 from "@/components/tools/ProductMatcherV2";

export default function ProductMatcherPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-12 sm:py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Badge className="bg-teal/20 text-teal-light border-teal/30 mb-4">
            <Sparkles className="h-3 w-3 mr-1" /> AI-Powered · Free to Use
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Product Matcher</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
            Find any product at China factory-direct prices.
            Paste a link, upload a photo, or describe any product.
            Our AI finds the same item at China factory-direct prices.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Package, label: "Describe or paste", sub: "Any product, any store" },
            { icon: Sparkles, label: "AI searches China", sub: "50,000+ factories" },
            { icon: DollarSign, label: "See real prices", sub: "Factory-direct USD" },
            { icon: Truck, label: "Get a quote", sub: "Delivered to your door" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border p-3 text-center shadow-sm">
              <s.icon className="h-5 w-5 mx-auto text-teal mb-1.5" />
              <p className="text-xs font-semibold text-navy">{s.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main matcher */}
      <section className="mx-auto max-w-3xl px-4 pb-8">
        <ProductMatcherV2 />
      </section>

      {/* Trust signals */}
      <section className="border-t bg-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-xl font-bold text-navy text-center mb-6">Why Use Our AI Product Matcher?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: "30-70% Savings",
                desc: "Skip the middlemen. Our AI sources directly from Chinese factories at wholesale prices.",
              },
              {
                icon: ShieldCheck,
                title: "Quality Assured",
                desc: "Every product goes through inspection at our warehouse in China before shipping to you.",
              },
              {
                icon: Truck,
                title: "Door-to-Door",
                desc: "We handle everything from sourcing to customs clearance to delivery at your US address.",
              },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-teal/10">
                  <f.icon className="h-5 w-5 text-teal" />
                </div>
                <h3 className="text-sm font-semibold text-navy">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy py-10 text-white text-center">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="text-xl font-bold mb-2">Need a Large Order or Custom Product?</h2>
          <p className="text-sm text-slate-300 mb-4">
            Our sourcing team handles bulk orders (100+ units), custom manufacturing, and private labeling.
          </p>
          <Link
            href="/quote"
            className="inline-flex items-center gap-2 bg-teal hover:bg-teal/90 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
          >
            Request Custom Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
