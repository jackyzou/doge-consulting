"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // Simulate form submission
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    toast.success("Message sent! We'll get back to you within 24 hours.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Get in Touch</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">Contact Us</h1>
            <p className="mt-4 text-lg text-slate-300">
              Have questions? Our bilingual team is here to help — in English or Chinese.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" placeholder="+1 (206) 555-0000" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help?" required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us about your shipping needs..." rows={5} required className="mt-1" />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-teal text-white hover:bg-teal/90">
                  {sending ? "Sending..." : "Send Message"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

              {[
                { icon: Mail, title: "Email", value: "dogetech77@gmail.com", subtitle: "We respond within 24 hours" },
                { icon: Phone, title: "Phone (US)", value: "+1 (206) 555-0188", subtitle: "Mon-Fri 9am-6pm PST" },
                { icon: Phone, title: "Phone (HK)", value: "+852 5555 0188", subtitle: "Mon-Fri 9am-6pm HKT" },
                { icon: MessageSquare, title: "WeChat", value: "DogeConsulting", subtitle: "Scan QR code to add us" },
              ].map((info) => (
                <Card key={info.title} className="border-border/50">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/10">
                      <info.icon className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <p className="font-semibold">{info.title}</p>
                      <p className="text-teal font-medium">{info.value}</p>
                      <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Locations */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-lg">Our Offices</h3>
                {[
                  { flag: "🇺🇸", city: "Seattle, WA", address: "Greater Seattle Area, USA" },
                  { flag: "🇭🇰", city: "Hong Kong", address: "Hong Kong SAR, China" },
                  { flag: "🇨🇳", city: "Foshan, Guangdong", address: "Foshan, Guangdong Province, China" },
                ].map((loc) => (
                  <div key={loc.city} className="flex items-center gap-3 text-sm">
                    <span className="text-2xl">{loc.flag}</span>
                    <div>
                      <p className="font-medium">{loc.city}</p>
                      <p className="text-muted-foreground">{loc.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
