"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import {
  Calculator, Globe, Package, Shield, DollarSign, TrendingUp, TrendingDown, ArrowRight, Info,
  AlertTriangle, BarChart3, Ship, Box, FileText, CheckCircle2, Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import {
  calculateRevenue,
  SOURCE_COUNTRIES,
  DESTINATIONS,
  PRODUCT_CATEGORIES,
  COMPLIANCE_PROFILES,
  FREIGHT_MODES,
  INCOTERMS,
  type RevenueCalcInput,
  type FreightMode,
  type IncotermCode,
} from "@/lib/landed-cost-calculator";
import { fmtCurrency, fmtPct, round } from "@/lib/unit-conversions";
import { ToolConversionGate, triggerToolGateCheck } from "@/components/conversion/ConversionGate";

const toNum = (s: string) => parseFloat(s) || 0;

export default function RevenueCalculatorPage() {  const { t } = useTranslation();  // ── Form state ──────────────────────────────────────────────
  const [sourceCountryId, setSourceCountryId] = useState("cn");
  const [destinationId, setDestinationId] = useState("us");
  const [categoryId, setCategoryId] = useState("electronics");
  const [complianceProfileId, setComplianceProfileId] = useState("electronics-fcc");
  const [freightMode, setFreightMode] = useState<FreightMode>("ocean-lcl");
  const [incotermCode, setIncotermCode] = useState<IncotermCode>("FOB");

  const [productCost, setProductCost] = useState("10.00");
  const [quantity, setQuantity] = useState("500");
  const [skuCount, setSkuCount] = useState("2");
  const [freightCost, setFreightCost] = useState("1800");
  const [insuranceCost, setInsuranceCost] = useState("120");
  const [originCharges, setOriginCharges] = useState("250");
  const [otherCosts, setOtherCosts] = useState("0.50");
  const [sellingPrice, setSellingPrice] = useState("35.00");
  const [benchmarkRetail, setBenchmarkRetail] = useState("");

  const [includeSection301, setIncludeSection301] = useState(true);
  const [includeSection122, setIncludeSection122] = useState(false);
  const [includeCustomsBond, setIncludeCustomsBond] = useState(true);

  // Auto-set compliance profile when category changes
  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    const cat = PRODUCT_CATEGORIES.find((c) => c.id === id);
    if (cat) setComplianceProfileId(cat.complianceProfileId);
  };

  const source = SOURCE_COUNTRIES.find((c) => c.id === sourceCountryId);
  const dest = DESTINATIONS.find((d) => d.id === destinationId);
  const category = PRODUCT_CATEGORIES.find((c) => c.id === categoryId);
  const compliance = COMPLIANCE_PROFILES.find((c) => c.id === complianceProfileId);
  const freight = FREIGHT_MODES.find((f) => f.id === freightMode);
  const incoterm = INCOTERMS.find((i) => i.code === incotermCode);

  const input: RevenueCalcInput = useMemo(() => ({
    sourceCountryId,
    destinationId,
    categoryId,
    complianceProfileId,
    freightMode,
    incotermCode,
    productCostPerUnit: toNum(productCost),
    quantity: toNum(quantity),
    skuCount: toNum(skuCount),
    freightCostTotal: toNum(freightCost),
    insuranceCostTotal: toNum(insuranceCost),
    originChargesTotal: toNum(originCharges),
    includeSection301,
    includeSection122,
    includeCustomsBond,
    sellingPricePerUnit: toNum(sellingPrice),
    otherCostsPerUnit: toNum(otherCosts),
    benchmarkRetailPricePerUnit: toNum(benchmarkRetail) || undefined,
  }), [sourceCountryId, destinationId, categoryId, complianceProfileId, freightMode, incotermCode, productCost, quantity, skuCount, freightCost, insuranceCost, originCharges, includeSection301, includeSection122, includeCustomsBond, sellingPrice, otherCosts, benchmarkRetail]);

  const result = useMemo(() => calculateRevenue(input), [input]);

  // Trigger conversion gate check whenever user changes a meaningful input
  useEffect(() => {
    if (input.productCostPerUnit > 0 && input.quantity > 0) {
      triggerToolGateCheck();
    }
  }, [input.productCostPerUnit, input.quantity, input.sellingPricePerUnit]);

  const isProfitable = result.grossProfit > 0;

  return (
    <ToolConversionGate toolName="revenue-calculator">
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">{t("tools.badge")}</Badge>
            <h1 className="text-4xl font-bold mb-4">Import Revenue &amp; Landed Cost Calculator</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Calculate the true landed cost of importing products — including duties, tariffs, taxes, compliance fees, and shipping.
              See your profit margin, ROI, and potential savings. Supports 13+ source countries, 5 destinations, 23 product categories.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
              <Badge variant="outline" className="border-white/30 text-white/90">Import Duty Calculator</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Section 301 Tariffs</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Compliance Fees</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Revenue &amp; ROI</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">13+ Countries</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">23 Product Categories</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* ── Left: Calculator Inputs ───────────────────────── */}
          <div className="space-y-6">
            {/* Trade Lane */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-teal" /> Trade Lane &amp; Product</CardTitle>
                <CardDescription>Select source country, destination, and product category</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Source Country</Label>
                  <Select value={sourceCountryId} onValueChange={setSourceCountryId}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCE_COUNTRIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.flag} {c.label}{c.section301 ? " ⚠️ 301" : ""}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Destination</Label>
                  <Select value={destinationId} onValueChange={setDestinationId}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DESTINATIONS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.flag} {d.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Product Category</Label>
                  <Select value={categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label} — HTS Ch.{c.htsChapter}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {category && <p className="text-xs text-muted-foreground mt-1">{category.htsNote}</p>}
                </div>
                <div>
                  <Label className="text-xs">Compliance Profile</Label>
                  <Select value={complianceProfileId} onValueChange={setComplianceProfileId}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_PROFILES.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {compliance && <p className="text-xs text-muted-foreground mt-1">{compliance.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Shipping & Commercial Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-teal" /> Shipping &amp; Commercial Terms</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Freight Mode</Label>
                  <Select value={freightMode} onValueChange={(v) => setFreightMode(v as FreightMode)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FREIGHT_MODES.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.icon} {f.label} — {f.transitDays}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Incoterm</Label>
                  <Select value={incotermCode} onValueChange={(v) => setIncotermCode(v as IncotermCode)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {INCOTERMS.map((i) => (
                        <SelectItem key={i.code} value={i.code}>{i.code} — {i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {incoterm && <p className="text-xs text-muted-foreground mt-1">{incoterm.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-teal" /> Costs &amp; Pricing</CardTitle>
                <CardDescription>All values in USD. Per-unit costs are multiplied by quantity automatically.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label className="text-xs">Product Cost / Unit ($)</Label>
                  <Input type="number" step="0.01" value={productCost} onChange={(e) => setProductCost(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Quantity (units)</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">SKU Count</Label>
                  <Input type="number" value={skuCount} onChange={(e) => setSkuCount(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Freight Cost — Total ($)</Label>
                  <Input type="number" step="0.01" value={freightCost} onChange={(e) => setFreightCost(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Insurance — Total ($)</Label>
                  <Input type="number" step="0.01" value={insuranceCost} onChange={(e) => setInsuranceCost(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Origin Charges — Total ($)</Label>
                  <Input type="number" step="0.01" value={originCharges} onChange={(e) => setOriginCharges(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Other Costs / Unit ($)</Label>
                  <Input type="number" step="0.01" value={otherCosts} onChange={(e) => setOtherCosts(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-teal">Selling Price / Unit ($)</Label>
                  <Input type="number" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="mt-1 border-teal/30" />
                </div>
                <div>
                  <Label className="text-xs">Benchmark Retail Price / Unit ($)</Label>
                  <Input type="number" step="0.01" value={benchmarkRetail} onChange={(e) => setBenchmarkRetail(e.target.value)} placeholder="Auto from category" className="mt-1" />
                </div>
              </CardContent>
            </Card>

            {/* Tariff Toggles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-gold" /> Tariff &amp; Compliance Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Section 301 Tariff (25%)</p>
                    <p className="text-xs text-muted-foreground">Additional tariff on most Chinese goods</p>
                  </div>
                  <Switch checked={includeSection301} onCheckedChange={setIncludeSection301} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reciprocal Tariff / IEEPA (2026)</p>
                    <p className="text-xs text-muted-foreground">
                      {source ? `${source.label}: ${(source.section122Rate * 100).toFixed(1)}%` : "Varies by country"} — subject to Supreme Court review
                    </p>
                  </div>
                  <Switch checked={includeSection122} onCheckedChange={setIncludeSection122} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Customs Bond</p>
                    <p className="text-xs text-muted-foreground">Required for US imports over $2,500</p>
                  </div>
                  <Switch checked={includeCustomsBond} onCheckedChange={setIncludeCustomsBond} />
                </div>
                {compliance && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-foreground flex items-center gap-1"><FileText className="h-3 w-3" /> {compliance.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{compliance.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {compliance.certifications.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-[10px]">{cert}</Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Lead time: {compliance.leadTimeDays}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── SEO Content ────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>How Import Duties Work — Complete Guide (2026)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  When importing goods into the United States, multiple layers of duties, taxes, and fees apply.
                  Understanding your <strong className="text-foreground">total landed cost</strong> — not just the product price — is essential for profitable importing.
                </p>
                <h3 className="text-foreground font-semibold">1. Base Import Duty (HTS Rate)</h3>
                <p>Every product has an HTS (Harmonized Tariff Schedule) code that determines its base duty rate. Rates range from 0% (electronics, toys) to 48%+ (footwear). Our calculator covers 23 major product categories.</p>
                <h3 className="text-foreground font-semibold">2. Section 301 Tariffs (China)</h3>
                <p>Since 2018, most goods from China face an additional 25% tariff on top of the base rate. This applies to $370+ billion worth of Chinese exports.</p>
                <h3 className="text-foreground font-semibold">3. IEEPA Reciprocal Tariffs (2026)</h3>
                <p>In 2026, the US imposed new reciprocal tariffs ranging from 10% to 46% on imports from most countries. China faces the highest rate at 145%. These tariffs are currently under Supreme Court review.</p>
                <h3 className="text-foreground font-semibold">4. MPF &amp; HMF</h3>
                <p>The Merchandise Processing Fee (0.3464%, min $32.71, max $634.62) and Harbor Maintenance Fee (0.125% for ocean shipments) are charged on all US imports.</p>
                <h3 className="text-foreground font-semibold">5. Compliance Costs</h3>
                <p>Depending on your product, you may need FCC certification (electronics), CPSC testing (children&apos;s products), FDA registration (food/cosmetics), or UL listing (lighting). These add $85–$2,500+ per shipment.</p>
                <Separator />
                <p className="flex items-center gap-2 font-medium text-foreground">
                  <Sparkles className="h-4 w-4 text-teal" /> How Doge Consulting Saves You Money
                </p>
                <p>Our team handles HTS classification optimization, tariff engineering, duty drawback claims, and FTZ strategies. On average, our clients save 8–15% on their total landed cost compared to self-managed imports.</p>
              </CardContent>
            </Card>

            {/* ── FAQ for SEO ────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="1" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What is landed cost?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Landed cost is the total cost of getting a product from the factory to your warehouse or customer. It includes: product cost + shipping + insurance + duties + tariffs + MPF + HMF + compliance fees + customs broker fees. This is the true cost basis for your pricing and profit calculations.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What is customs value (CIF)?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Customs value is the total value that customs uses to calculate duties. In the US, it&apos;s based on the transaction value (FOB price) plus any assists. For most countries, it&apos;s the CIF value (Cost + Insurance + Freight). This calculator uses the appropriate method based on your selected destination.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="3" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What profit margin should I target?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      For physical products, a gross margin of 30–50% is healthy. For Amazon FBA, aim for 25%+ after all fees. For wholesale distribution, 15–25% is typical. Our calculator shows your gross margin and ROI so you can validate your pricing before committing to an order.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="4" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">How do I reduce import duties?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Several legal strategies exist: (1) Correct HTS classification — many products are misclassified at higher rates. (2) First Sale valuation — use the factory price, not the middleman price. (3) Foreign Trade Zones — defer or reduce duties. (4) Duty drawback — claim refunds on re-exported goods. (5) Tariff engineering — modify products slightly to qualify for lower-duty HTS codes. Doge Consulting can help with all of these strategies.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="5" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What is Section 301 and does it apply to my product?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Section 301 tariffs are additional duties (typically 25%) on goods imported from China. They were imposed starting in 2018 and apply to most manufactured goods. Some exclusions exist — check the USTR exclusion list for your specific HTS code. Our calculator includes Section 301 by default for China-origin goods.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Results Sidebar ────────────────────────── */}
          <div className="space-y-4">
            {/* Landed Cost Breakdown */}
            <Card className="sticky top-24 border-teal/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-teal" /> Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.lines.map((line) => (
                  <div key={line.key} className={`flex justify-between py-1.5 text-sm ${line.key === "total" ? "" : "border-b"}`}>
                    <div className="flex-1 min-w-0">
                      <span className={`${line.category === "duty" ? "text-red-600" : "text-muted-foreground"}`}>
                        {line.label}
                      </span>
                      {line.rate !== undefined && line.rate > 0 && (
                        <span className="text-[10px] text-muted-foreground ml-1">({fmtPct(line.rate * 100)})</span>
                      )}
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <span className={`font-medium ${line.category === "duty" ? "text-red-600" : ""}`}>
                        {fmtCurrency(line.total)}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {fmtCurrency(line.perUnit)}/unit
                      </span>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Totals */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between py-2 bg-muted/50 rounded-lg px-3 -mx-1">
                    <span className="font-semibold text-sm">Total Landed Cost</span>
                    <div className="text-right">
                      <span className="text-lg font-bold text-teal">{fmtCurrency(result.totalLandedCost)}</span>
                      <span className="text-xs text-muted-foreground block">{fmtCurrency(result.landedCostPerUnit)}/unit</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm py-1 border-b">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-medium">{fmtCurrency(result.totalRevenue)}</span>
                  </div>
                </div>

                <Separator />

                {/* Profit */}
                <div className={`rounded-lg p-3 -mx-1 ${isProfitable ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm flex items-center gap-1">
                      {isProfitable ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                      Gross Profit
                    </span>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${isProfitable ? "text-green-700" : "text-red-700"}`}>
                        {fmtCurrency(result.grossProfit)}
                      </span>
                      <span className="text-xs text-muted-foreground block">{fmtCurrency(result.grossProfitPerUnit)}/unit</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center p-2 bg-white/60 rounded">
                      <p className={`text-lg font-bold ${isProfitable ? "text-green-700" : "text-red-700"}`}>{fmtPct(result.grossMarginPct)}</p>
                      <p className="text-[10px] text-muted-foreground">Gross Margin</p>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded">
                      <p className={`text-lg font-bold ${isProfitable ? "text-green-700" : "text-red-700"}`}>{fmtPct(result.roiPct)}</p>
                      <p className="text-[10px] text-muted-foreground">ROI</p>
                    </div>
                  </div>
                </div>

                {/* Effective Rates */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-sm font-bold">{fmtPct(result.effectiveDutyRate)}</p>
                    <p className="text-[10px] text-muted-foreground">Effective Duty Rate</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded">
                    <p className="text-sm font-bold">{fmtPct(result.effectiveTotalTaxRate)}</p>
                    <p className="text-[10px] text-muted-foreground">Total Tax Rate</p>
                  </div>
                </div>

                {/* Savings */}
                {result.savingsVsRetail > 0 && (
                  <div className="rounded-lg bg-teal/5 p-3 -mx-1 border border-teal/10">
                    <p className="text-xs font-semibold text-teal flex items-center gap-1"><Sparkles className="h-3 w-3" /> Savings vs Retail</p>
                    <p className="text-lg font-bold text-teal">{fmtCurrency(result.savingsVsRetail)}</p>
                    <p className="text-[10px] text-muted-foreground">{fmtPct(result.savingsVsRetailPct)} less than US retail ({category?.retailMarkupRange} typical markup)</p>
                  </div>
                )}

                {result.dogeServiceSavingsEstimate > 0 && (
                  <div className="rounded-lg bg-gold/5 p-3 -mx-1 border border-gold/10">
                    <p className="text-xs font-semibold text-gold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Doge Consulting Can Save You</p>
                    <p className="text-lg font-bold text-gold">{fmtCurrency(result.dogeServiceSavingsEstimate)}</p>
                    <p className="text-[10px] text-muted-foreground">Est. 8% savings via HTS optimization, tariff engineering &amp; duty drawback</p>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="space-y-1 pt-1">
                    {result.warnings.map((w, i) => (
                      <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                        <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" /> {w}
                      </p>
                    ))}
                  </div>
                )}

                <Separator />

                {/* CTAs */}
                <div className="space-y-2 pt-1">
                  <Link href="/quote" className="block">
                    <Button className="w-full bg-teal hover:bg-teal/90 gap-2">
                      Get Quote <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/contact" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Sparkles className="h-4 w-4" /> Free Duty Optimization Consult
                    </Button>
                  </Link>
                  <Link href="/tools/cbm-calculator" className="block">
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      <Calculator className="h-4 w-4" /> CBM Calculator
                    </Button>
                  </Link>
                  <Link href="/tools/3d-visualizer" className="block">
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      <Box className="h-4 w-4" /> 3D Container Visualizer
                    </Button>
                  </Link>
                </div>

                {/* Disclaimer */}
                <div className="text-[10px] text-muted-foreground pt-2 space-y-1">
                  <p className="font-medium text-foreground">⚠️ Disclaimer</p>
                  <p>This calculator provides estimates. Actual duties depend on your specific HTS code. Tariff rates change frequently. Always confirm with a licensed customs broker.</p>
                  <p><strong>We handle all customs clearance</strong> — our team determines exact duties for your shipment.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ToolConversionGate>
  );
}
