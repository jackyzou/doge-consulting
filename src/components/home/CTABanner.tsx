"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTABanner() {
  return (
    <section className="gradient-hero py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Ship Your Products from China?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Get a free, no-obligation quote in under 2 minutes. Our team will
            respond with a detailed shipping plan within 24 hours.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/quote">
              <Button size="lg" className="bg-teal text-white hover:bg-teal/90 text-base px-8">
                Get Free Quote <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 text-base">
                Talk to Our Team
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
