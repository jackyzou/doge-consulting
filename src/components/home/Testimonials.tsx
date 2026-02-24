"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Michael Zhang",
    location: "Seattle, WA",
    rating: 5,
    text: "Shipped an entire living room set — marble dining table, sofa, and TV console. Saved over $8,000 compared to buying locally. The quality is incredible and the whole process was seamless.",
    items: "Marble Dining Table Set + Sofa + TV Console",
  },
  {
    name: "Emily Wang",
    location: "Bellevue, WA",
    rating: 5,
    text: "As a new homeowner, furnishing was overwhelming and expensive. Doge Consulting sourced everything from Foshan and delivered it to my door in 6 weeks. Couldn't be happier!",
    items: "Full Home Furnishing — 12 pieces",
  },
  {
    name: "David Chen",
    location: "Redmond, WA",
    rating: 5,
    text: "The tracking system kept me updated every step. When my wardrobe arrived, it was perfectly packed with zero damage. Will definitely use them again for my office furniture.",
    items: "Bedroom Set + Custom Wardrobe",
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            What Our <span className="text-teal">Customers</span> Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Join hundreds of happy homeowners who saved big on premium furniture.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Card className="h-full border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="mt-6 border-t pt-4">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                    <p className="mt-1 text-xs text-teal font-medium">{t.items}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
