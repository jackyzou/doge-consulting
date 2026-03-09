"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", label: "US +1" },
  { code: "+1", flag: "🇨🇦", label: "CA +1" },
  { code: "+86", flag: "🇨🇳", label: "CN +86" },
  { code: "+852", flag: "🇭🇰", label: "HK +852" },
  { code: "+886", flag: "🇹🇼", label: "TW +886" },
  { code: "+44", flag: "🇬🇧", label: "UK +44" },
  { code: "+61", flag: "🇦🇺", label: "AU +61" },
  { code: "+81", flag: "🇯🇵", label: "JP +81" },
  { code: "+82", flag: "🇰🇷", label: "KR +82" },
  { code: "+91", flag: "🇮🇳", label: "IN +91" },
  { code: "+49", flag: "🇩🇪", label: "DE +49" },
  { code: "+33", flag: "🇫🇷", label: "FR +33" },
  { code: "+34", flag: "🇪🇸", label: "ES +34" },
  { code: "+52", flag: "🇲🇽", label: "MX +52" },
  { code: "+55", flag: "🇧🇷", label: "BR +55" },
  { code: "+65", flag: "🇸🇬", label: "SG +65" },
  { code: "+971", flag: "🇦🇪", label: "AE +971" },
];

export default function ContactPage() {
  const { t } = useTranslation();
  const [sending, setSending] = useState(false);
  const [countryCode, setCountryCode] = useState("+1");

  const contactInfo = [
    { icon: Mail, title: t("contactPage.emailTitle"), value: "dogetech77@gmail.com", subtitle: t("contactPage.emailSubtitle") },
    { icon: Phone, title: t("contactPage.phoneUS"), value: "+1 (425) 223-0449", subtitle: t("contactPage.phoneUSSubtitle") },
    { icon: Phone, title: t("contactPage.phoneHK"), value: "+852 6679 7310", subtitle: t("contactPage.phoneHKSubtitle") },
    { icon: MessageSquare, title: t("contactPage.wechat"), value: t("contactPage.wechatValue"), subtitle: t("contactPage.wechatSubtitle") },
  ];

  const offices = [
    { flag: "🇺🇸", city: t("contactPage.office1City"), address: t("contactPage.office1Addr") },
    { flag: "🇭🇰", city: t("contactPage.office2City"), address: t("contactPage.office2Addr") },
    { flag: "🇨🇳", city: t("contactPage.office3City"), address: t("contactPage.office3Addr") },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || "",
      countryCode: (formData.get("phone") as string) ? countryCode : "",
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        toast.error(t("contactPage.rateLimited"));
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send");
      }

      toast.success(t("contactPage.sent"));
      form.reset();
    } catch {
      toast.error(t("contactPage.error"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("contactPage.badge")}</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">{t("contactPage.title")}</h1>
            <p className="mt-4 text-lg text-slate-300">
              {t("contactPage.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl font-bold mb-6">{t("contactPage.formTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">{t("contactPage.name")}</Label>
                    <Input id="name" name="name" placeholder={t("contactPage.namePlaceholder")} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contactPage.email")}</Label>
                    <Input id="email" name="email" type="email" placeholder={t("contactPage.emailPlaceholder")} required className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">{t("contactPage.phone")}</Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-[110px] shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRY_CODES.map((cc) => (
                          <SelectItem key={cc.label} value={cc.code}>
                            {cc.flag} {cc.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input id="phone" name="phone" placeholder="425-223-0449" className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">{t("contactPage.subject")}</Label>
                  <Input id="subject" name="subject" placeholder={t("contactPage.subjectPlaceholder")} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="message">{t("contactPage.message")}</Label>
                  <Textarea id="message" name="message" placeholder={t("contactPage.messagePlaceholder")} rows={5} required className="mt-1" />
                </div>
                <Button type="submit" disabled={sending} className="w-full bg-teal text-white hover:bg-teal/90">
                  {sending ? t("contactPage.sending") : t("contactPage.send")}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">{t("contactPage.infoTitle")}</h2>

              {contactInfo.map((info) => (
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
                <h3 className="font-semibold text-lg">{t("contactPage.officesTitle")}</h3>
                {offices.map((loc) => (
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
