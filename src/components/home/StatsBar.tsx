"use client";

import { motion } from "framer-motion";
import { Package, Clock, ThumbsUp, MapPin } from "lucide-react";

const stats = [
  { icon: Package, value: "500+", label: "Items Shipped", color: "text-teal" },
  { icon: Clock, value: "5-8", label: "Weeks Average", color: "text-gold" },
  { icon: ThumbsUp, value: "98%", label: "Satisfaction Rate", color: "text-teal" },
  { icon: MapPin, value: "Door", label: "to Door Service", color: "text-gold" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
