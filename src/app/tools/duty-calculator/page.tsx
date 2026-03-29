"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Search, DollarSign, ArrowRight, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";

// Common HTS categories with duty rates for China→USA imports
const PRODUCT_CATEGORIES = [
  { id: "furniture-wood", name: "Wood Furniture (Chairs, Tables, Cabinets)", htsChapter: "94", dutyRate: 0.0, note: "Most wood furniture from China: 0% duty" },
  { id: "furniture-metal", name: "Metal Furniture (Office, Shelving)", htsChapter: "94", dutyRate: 0.0, note: "Most metal furniture: 0% duty" },
  { id: "furniture-upholstered", name: "Upholstered Furniture (Sofas, Mattresses)", htsChapter: "94", dutyRate: 0.0, note: "Most upholstered: 0% duty" },
  { id: "lighting", name: "Lighting & Lamps", htsChapter: "94", dutyRate: 3.9, note: "Average 3.9% duty" },
  { id: "ceramics", name: "Ceramics & Porcelain", htsChapter: "69", dutyRate: 9.8, note: "Tableware: ~9.8%, tiles: ~8.5%" },
  { id: "stone-marble", name: "Stone & Marble Products", htsChapter: "68", dutyRate: 4.9, note: "Marble slabs/tiles: ~4.9%" },
  { id: "textiles", name: "Textiles & Fabrics", htsChapter: "52-63", dutyRate: 12.0, note: "Average ~12%, ranges 5-32%" },
  { id: "electronics-consumer", name: "Consumer Electronics", htsChapter: "85", dutyRate: 0.0, note: "Most consumer electronics: 0% duty" },
  { id: "electronics-components", name: "Electronic Components", htsChapter: "85", dutyRate: 0.0, note: "Most components: 0% duty" },
  { id: "appliances", name: "Home Appliances", htsChapter: "84-85", dutyRate: 2.4, note: "Ranges 0-3.9%" },
  { id: "tools", name: "Hand Tools & Hardware", htsChapter: "82", dutyRate: 5.3, note: "Average ~5.3%" },
  { id: "plastics", name: "Plastic Products", htsChapter: "39", dutyRate: 5.3, note: "Average ~5.3%" },
  { id: "glass", name: "Glass & Glassware", htsChapter: "70", dutyRate: 6.6, note: "Average ~6.6%" },
  { id: "rubber", name: "Rubber Products", htsChapter: "40", dutyRate: 4.2, note: "Average ~4.2%" },
  { id: "auto-parts", name: "Auto Parts & Accessories", htsChapter: "87", dutyRate: 2.5, note: "Average ~2.5%" },
  { id: "toys", name: "Toys & Games", htsChapter: "95", dutyRate: 0.0, note: "Most toys: 0% duty" },
  { id: "sporting", name: "Sporting Goods", htsChapter: "95", dutyRate: 4.0, note: "Ranges 0-5.5%" },
  { id: "bags-luggage", name: "Bags & Luggage", htsChapter: "42", dutyRate: 8.0, note: "Ranges 3.3-20%" },
  { id: "footwear", name: "Footwear", htsChapter: "64", dutyRate: 10.0, note: "Ranges 6-48% depending on material" },
  { id: "window-blinds", name: "Window Blinds & Coverings", htsChapter: "63/39", dutyRate: 6.5, note: "Textile blinds ~6.5% (HTS 6303.92), plastic/PVC ~5.3% (HTS 3925.30), aluminum venetian ~5.7%" },
];

// Section 301 tariff info
const SECTION_301_RATE = 25; // Standard Section 301 tariff on China goods

export default function DutyCalculatorPage() {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [productValue, setProductValue] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [insuranceCost, setInsuranceCost] = useState("");
  const [includeSection301, setIncludeSection301] = useState(true);

  const selectedCategory = PRODUCT_CATEGORIES.find((c) => c.id === category);
  const value = parseFloat(productValue) || 0;
  const shipping = parseFloat(shippingCost) || 0;
  const insurance = parseFloat(insuranceCost) || 0;

  // Customs value = product value + shipping + insurance (CIF)
  const customsValue = value + shipping + insurance;
  const baseDutyRate = selectedCategory?.dutyRate || 0;
  const baseDuty = customsValue * (baseDutyRate / 100);
  const section301Duty = includeSection301 ? customsValue * (SECTION_301_RATE / 100) : 0;
  const totalDuty = baseDuty + section301Duty;
  const mphFee = Math.min(Math.max(customsValue * 0.003464, 31.67), 614.35); // Merchandise Processing Fee
  const hmtFee = customsValue > 0 ? customsValue * 0.00125 : 0; // Harbor Maintenance Tax
  const totalLandedCost = customsValue + totalDuty + mphFee + hmtFee;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">{t("tools.dutyBadge")}</Badge>
            <h1 className="text-4xl font-bold mb-4">{t("tools.dutyPageTitle")}</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              {t("tools.dutyPageDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Calculator Form */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-teal" /> {t("tools.productCategoryLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("tools.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name} — HTS Ch.{cat.htsChapter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCategory && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                    <p className="text-muted-foreground">{selectedCategory.note}</p>
                    <p className="font-medium mt-1">{t("tools.baseDutyRate")}: {selectedCategory.dutyRate}%</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-teal" /> {t("tools.valueAndCosts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t("tools.productValue")}</Label>
                  <Input type="number" placeholder="e.g. 5000" value={productValue} onChange={(e) => setProductValue(e.target.value)} className="mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("tools.shippingCost")}</Label>
                    <Input type="number" placeholder="e.g. 800" value={shippingCost} onChange={(e) => setShippingCost(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t("tools.insurance")}</Label>
                    <Input type="number" placeholder="e.g. 50" value={insuranceCost} onChange={(e) => setInsuranceCost(e.target.value)} className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gold" /> {t("tools.section301Info")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("tools.includeSection301")}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("tools.section301Note")}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={includeSection301} onChange={(e) => setIncludeSection301(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24 border-teal/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-teal" /> {t("tools.estimatedDuties")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">{t("tools.customsValue")}</span>
                  <span className="font-medium">${customsValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">Base Duty ({baseDutyRate}%)</span>
                  <span className="font-medium">${baseDuty.toFixed(2)}</span>
                </div>
                {includeSection301 && (
                  <div className="flex justify-between py-2 border-b text-sm">
                    <span className="text-muted-foreground">Section 301 ({SECTION_301_RATE}%)</span>
                    <span className="font-medium text-red-600">${section301Duty.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">MPF (0.3464%)</span>
                  <span className="font-medium">${customsValue > 0 ? mphFee.toFixed(2) : "0.00"}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm">
                  <span className="text-muted-foreground">HMT (0.125%)</span>
                  <span className="font-medium">${hmtFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b text-sm font-semibold">
                  <span>{t("tools.totalDutiesFees")}</span>
                  <span className="text-red-600">${(totalDuty + mphFee + hmtFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 bg-teal/5 rounded-lg px-3 -mx-1">
                  <span className="font-semibold">{t("tools.totalLandedCost")}</span>
                  <span className="text-xl font-bold text-teal">${totalLandedCost.toFixed(2)}</span>
                </div>

                {customsValue > 0 && (
                  <div className="text-xs text-muted-foreground pt-2 space-y-1">
                    <p>{t("tools.effectiveDutyRateLabel")}: <strong>{((totalDuty / customsValue) * 100).toFixed(1)}%</strong></p>
                    <p>{t("tools.dutiesAsPct")}: <strong>{value > 0 ? ((totalDuty / value) * 100).toFixed(1) : 0}%</strong></p>
                  </div>
                )}

                <Link href="/quote" className="block pt-2">
                  <Button className="w-full bg-teal hover:bg-teal/90">
                    {t("tools.getQuote")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardContent className="p-4 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground mb-2">{"\u26A0\uFE0F"} {t("tools.disclaimer").split(".")[0]}.</p>
                <p>
                  {t("tools.disclaimer")}
                </p>
                <p className="mt-2">
                  <strong>{t("tools.weHandle")}</strong>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
