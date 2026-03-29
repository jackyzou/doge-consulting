"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import { Calculator, Plus, Trash2, Box, ArrowRight, Ruler, Scale, Ship, Info, BarChart3, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type LengthUnit, toCm, fromCm, calculateCBM, volumetricWeight, cbmToCubicFeet, cbmToLiters, cbmToUsGallons, CONTAINERS, unitsFit, volumeUtilization, weightUtilization, round } from "@/lib/unit-conversions";

// ── Types ─────────────────────────────────────────────────────
interface Item {
  id: number;
  name: string;
  length: string;
  width: string;
  height: string;
  weight: string;
  qty: string;
}

let nextId = 1;

const UNIT_OPTIONS: { value: LengthUnit; label: string; abbr: string }[] = [
  { value: "cm", label: "Centimeters (cm)", abbr: "cm" },
  { value: "mm", label: "Millimeters (mm)", abbr: "mm" },
  { value: "in", label: "Inches (in)", abbr: "in" },
  { value: "ft", label: "Feet (ft)", abbr: "ft" },
  { value: "m", label: "Meters (m)", abbr: "m" },
];

const PRESETS = [
  { name: "Sofa (3-seater)", l: 220, w: 90, h: 85, wt: 60, icon: "🛋️" },
  { name: "Dining Table (6P)", l: 180, w: 90, h: 76, wt: 45, icon: "🪑" },
  { name: "King Bed Frame", l: 210, w: 195, h: 40, wt: 80, icon: "🛏️" },
  { name: "Wardrobe", l: 200, w: 60, h: 220, wt: 90, icon: "🗄️" },
  { name: "Office Desk", l: 140, w: 70, h: 75, wt: 40, icon: "💼" },
  { name: "TV Console", l: 160, w: 45, h: 55, wt: 35, icon: "📺" },
  { name: "Electronics Pallet", l: 120, w: 80, h: 120, wt: 200, icon: "📱" },
  { name: "Textile Bale", l: 100, w: 80, h: 80, wt: 35, icon: "🧵" },
  { name: "Standard Carton", l: 60, w: 40, h: 40, wt: 15, icon: "📦" },
  { name: "Roller Blind (boxed)", l: 180, w: 12, h: 12, wt: 3, icon: "🪟" },
  { name: "Venetian Blind (boxed)", l: 190, w: 15, h: 15, wt: 5, icon: "🪟" },
  { name: "Motorized Blind Kit", l: 200, w: 15, h: 15, wt: 6, icon: "🪟" },
];

export default function CBMCalculatorPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const unitLabel = UNIT_OPTIONS.find((u) => u.value === unit)?.abbr || "cm";

  const addItem = () => {
    setItems([...items, { id: nextId++, name: `Item ${items.length + 1}`, length: "", width: "", height: "", weight: "", qty: "1" }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof Item, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const addPreset = (preset: typeof PRESETS[0]) => {
    const l = fromCm(preset.l, unit);
    const w = fromCm(preset.w, unit);
    const h = fromCm(preset.h, unit);
    setItems([...items, {
      id: nextId++,
      name: `${preset.icon} ${preset.name}`,
      length: round(l, 1).toString(),
      width: round(w, 1).toString(),
      height: round(h, 1).toString(),
      weight: preset.wt.toString(),
      qty: "1",
    }]);
  };

  const resetAll = () => {
    nextId = 1;
    setItems([]);
  };

  const calculations = useMemo(() => items.map((item) => {
    const l = parseFloat(item.length) || 0;
    const w = parseFloat(item.width) || 0;
    const h = parseFloat(item.height) || 0;
    const wt = parseFloat(item.weight) || 0;
    const qty = parseInt(item.qty) || 1;
    const cbmPerUnit = calculateCBM(l, w, h, unit);
    const volWt = volumetricWeight(l, w, h, unit);
    return {
      cbmPerUnit,
      cbmTotal: cbmPerUnit * qty,
      volWeightPerUnit: volWt,
      volWeightTotal: volWt * qty,
      actualWeightTotal: wt * qty,
      qty,
    };
  }), [items, unit]);

  const totals = useMemo(() => calculations.reduce(
    (acc, c) => ({
      cbm: acc.cbm + c.cbmTotal,
      volWeight: acc.volWeight + c.volWeightTotal,
      actualWeight: acc.actualWeight + c.actualWeightTotal,
      items: acc.items + c.qty,
    }),
    { cbm: 0, volWeight: 0, actualWeight: 0, items: 0 }
  ), [calculations]);

  const chargeableWt = Math.max(totals.volWeight, totals.actualWeight);

  const router = useRouter();

  // Items with actual dimensions entered
  const validItems = useMemo(() => items.filter((item) => {
    const l = parseFloat(item.length) || 0;
    const w = parseFloat(item.width) || 0;
    const h = parseFloat(item.height) || 0;
    return l > 0 && w > 0 && h > 0;
  }), [items]);

  const handleGetQuote = () => {
    // Convert CBM items to quote page format and store in sessionStorage
    const quoteItems = validItems.map((item) => {
      const l = parseFloat(item.length) || 0;
      const w = parseFloat(item.width) || 0;
      const h = parseFloat(item.height) || 0;
      const wt = parseFloat(item.weight) || 0;
      const qty = parseInt(item.qty) || 1;
      const cbm = calculateCBM(l, w, h, unit);
      const lcm = toCm(l, unit);
      const wcm = toCm(w, unit);
      const hcm = toCm(h, unit);
      return {
        name: item.name || `Cargo (${round(lcm, 0)}×${round(wcm, 0)}×${round(hcm, 0)} cm)`,
        quantity: qty,
        cbm: round(cbm, 4),
        weightKG: wt,
      };
    });
    sessionStorage.setItem("cbm-quote-items", JSON.stringify(quoteItems));
    router.push("/quote?from=cbm");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">{t("tools.badge")}</Badge>
            <h1 className="text-4xl font-bold mb-4">{t("tools.cbmTitle")}</h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              {t("tools.cbmDesc")}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <Badge variant="outline" className="border-white/30 text-white/90">CBM Calculator</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Volumetric Weight</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Container Fit</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Multi-Unit Support</Badge>
              <Badge variant="outline" className="border-white/30 text-white/90">Product Presets</Badge>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-teal" />
            <Label className="text-sm font-medium">{t("tools.unit")}</Label>
            <Select value={unit} onValueChange={(v) => setUnit(v as LengthUnit)}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={resetAll} className="gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> {t("tools.reset")}
          </Button>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* ── Left: Calculator ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Product presets */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Box className="h-4 w-4 text-gold" /> {t("tools.presets")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p) => (
                    <Button key={p.name} variant="outline" size="sm" onClick={() => addPreset(p)} className="text-xs gap-1">
                      {p.icon} {p.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Empty state */}
            {items.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Box className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No items yet</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Add an item using a preset above or the button below</p>
                  <Button onClick={addItem} className="bg-teal hover:bg-teal/90 gap-1">
                    <Plus className="h-4 w-4" /> Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Items */}
            {items.map((item, idx) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="font-medium border-0 p-0 h-auto text-base focus-visible:ring-0 max-w-[250px]"
                      />
                      <div className="flex items-center gap-2">
                        {calculations[idx] && calculations[idx].cbmPerUnit > 0 && (
                          <Badge variant="secondary" className="text-xs">{round(calculations[idx].cbmTotal, 4)} m³</Badge>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Length ({unitLabel})</Label>
                        <Input type="number" placeholder="0" value={item.length} onChange={(e) => updateItem(item.id, "length", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Width ({unitLabel})</Label>
                        <Input type="number" placeholder="0" value={item.width} onChange={(e) => updateItem(item.id, "width", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Height ({unitLabel})</Label>
                        <Input type="number" placeholder="0" value={item.height} onChange={(e) => updateItem(item.id, "height", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
                        <Input type="number" placeholder="0" value={item.weight} onChange={(e) => updateItem(item.id, "weight", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Qty</Label>
                        <Input type="number" min="1" placeholder="1" value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    {calculations[idx] && calculations[idx].cbmPerUnit > 0 && (
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>CBM/unit: <strong className="text-foreground">{round(calculations[idx].cbmPerUnit, 4)}</strong></span>
                        <span>Vol. weight: <strong className="text-foreground">{round(calculations[idx].volWeightPerUnit, 1)} kg</strong></span>
                        <span>Total CBM: <strong className="text-teal">{round(calculations[idx].cbmTotal, 4)}</strong></span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {items.length > 0 && (
              <Button variant="outline" onClick={addItem} className="w-full border-dashed">
                <Plus className="h-4 w-4 mr-2" /> Add Another Item
              </Button>
            )}

            {/* ── Container Fit Visualization ─────────────────── */}
            {totals.cbm > 0 && (
              <Card className="border-teal/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="h-5 w-5 text-teal" /> Container Fit Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {CONTAINERS.map((c) => {
                    const volPct = volumeUtilization(totals.cbm, c.cbm);
                    const wtPct = weightUtilization(totals.actualWeight, c.maxKg);
                    const fits = unitsFit(totals.cbm / Math.max(totals.items, 1), c.cbm);
                    const overVolume = volPct > 100;
                    const overWeight = wtPct > 100;

                    return (
                      <div key={c.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm">{c.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.internalM.l}m × {c.internalM.w}m × {c.internalM.h}m · {c.cbm} m³ · {(c.maxKg / 1000).toFixed(1)}t max
                            </p>
                          </div>
                          <Badge variant={overVolume || overWeight ? "destructive" : volPct > 80 ? "default" : "secondary"} className="text-xs">
                            {overVolume ? "Won't fit" : `~${fits} units`}
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs w-16 text-muted-foreground">Volume</span>
                            <Progress value={Math.min(volPct, 100)} className={`h-3 flex-1 ${overVolume ? "[&>div]:bg-red-500" : "[&>div]:bg-teal"}`} />
                            <span className={`text-xs font-medium w-12 text-right ${overVolume ? "text-red-600" : ""}`}>{round(volPct, 1)}%</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs w-16 text-muted-foreground">Weight</span>
                            <Progress value={Math.min(wtPct, 100)} className={`h-3 flex-1 ${overWeight ? "[&>div]:bg-red-500" : "[&>div]:bg-navy-light"}`} />
                            <span className={`text-xs font-medium w-12 text-right ${overWeight ? "text-red-600" : ""}`}>{round(wtPct, 1)}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="h-3 w-3" /> Real-world container utilization is typically 80–90% due to packing gaps.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── Volume Conversions ──────────────────────────── */}
            {totals.cbm > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-teal" /> Volume Conversions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-teal">{round(totals.cbm, 4)}</p>
                      <p className="text-xs text-muted-foreground">Cubic Meters (m³)</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">{round(cbmToCubicFeet(totals.cbm), 2)}</p>
                      <p className="text-xs text-muted-foreground">Cubic Feet (ft³)</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">{round(cbmToLiters(totals.cbm), 1)}</p>
                      <p className="text-xs text-muted-foreground">Liters (L)</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-navy">{round(cbmToUsGallons(totals.cbm), 1)}</p>
                      <p className="text-xs text-muted-foreground">US Gallons</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── SEO Content: What is CBM? ──────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>What is CBM? — Complete Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">CBM (Cubic Meter)</strong> is the standard unit of measurement for ocean freight volume in international shipping.
                  One CBM equals the volume of a cube measuring 1 meter on each side (1m × 1m × 1m = 1,000 liters).
                </p>
                <h3 className="text-foreground font-semibold">How to Calculate CBM</h3>
                <p>
                  <code className="bg-muted px-2 py-0.5 rounded text-xs">CBM = Length (m) × Width (m) × Height (m)</code>
                </p>
                <p>If your measurements are in centimeters: <code className="bg-muted px-2 py-0.5 rounded text-xs">CBM = (L × W × H) ÷ 1,000,000</code></p>
                <Separator />
                <h3 className="text-foreground font-semibold">CBM to KG (Volumetric Weight)</h3>
                <p>
                  Freight carriers charge by <strong className="text-foreground">chargeable weight</strong> — the greater of actual weight or volumetric weight.
                  Volumetric weight converts volume to an equivalent weight:
                </p>
                <p><code className="bg-muted px-2 py-0.5 rounded text-xs">Volumetric Weight (kg) = (L × W × H in cm) ÷ 6,000</code></p>
                <p>For express/courier: <code className="bg-muted px-2 py-0.5 rounded text-xs">÷ 5,000</code> instead of 6,000.</p>
                <Separator />
                <h3 className="text-foreground font-semibold">CBM to Ton</h3>
                <p>
                  In ocean freight, <strong className="text-foreground">1 CBM = 1 freight ton (revenue ton)</strong> for billing purposes.
                  LCL shipments are charged per CBM or per 1,000 kg (1 metric ton) — whichever is greater.
                </p>
                <Separator />
                <h3 className="text-foreground font-semibold">Container Capacities</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Container</th>
                        <th className="text-right py-2 px-2">Internal (m)</th>
                        <th className="text-right py-2 px-2">Volume</th>
                        <th className="text-right py-2 px-2">Max Load</th>
                        <th className="text-right py-2 pl-2">Price Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CONTAINERS.map((c) => (
                        <tr key={c.type} className="border-b">
                          <td className="py-2 pr-4 font-medium text-foreground">{c.label}</td>
                          <td className="text-right py-2 px-2">{c.internalM.l} × {c.internalM.w} × {c.internalM.h}</td>
                          <td className="text-right py-2 px-2">{c.cbm} m³</td>
                          <td className="text-right py-2 px-2">{(c.maxKg / 1000).toFixed(1)} tons</td>
                          <td className="text-right py-2 pl-2">{c.priceRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What is the difference between CBM and volumetric weight?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      CBM (cubic meters) measures the physical volume of your cargo. Volumetric weight converts that volume into a weight equivalent using the formula L×W×H÷6000 (in cm).
                      Freight carriers charge based on the greater of actual weight or volumetric weight — this is called the &quot;chargeable weight.&quot;
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="2" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">When should I use LCL vs FCL?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      LCL (Less than Container Load) is best for shipments under 15 CBM — you share container space and pay per CBM.
                      FCL (Full Container Load) is more economical for shipments over 15 CBM. A 20ft container holds ~33 CBM, a 40ft holds ~67 CBM, and a 40ft High Cube holds ~76 CBM.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="3" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">How do I convert CBM to cubic feet?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      1 CBM = 35.3147 cubic feet. Simply multiply your CBM value by 35.3147 to get cubic feet.
                      Our calculator does this conversion automatically in the Volume Conversions section.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="4" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">How accurate is the container fit calculation?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      Our calculator uses 85% packing efficiency by default, which accounts for gaps between items, pallets, and packing materials.
                      Real-world utilization varies from 80–95% depending on cargo shape and packing method. For irregular shapes, expect closer to 70–80%.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="5" className="rounded-lg border px-4">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">What is a revenue ton in shipping?</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      A revenue ton (also called freight ton or billing ton) is the unit carriers use for pricing. It&apos;s the greater of 1 CBM or 1,000 kg.
                      If your cargo is 5 CBM but only weighs 2,000 kg, you&apos;re billed for 5 revenue tons (volume wins). If it&apos;s 2 CBM but weighs 4,000 kg, you&apos;re billed for 4 revenue tons (weight wins).
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* ── Right: Summary Sidebar ────────────────────────── */}
          <div className="space-y-4">
            <Card className="sticky top-24 border-teal/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-teal" /> {t("tools.summary")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.totalItems")}</span>
                    <span className="font-semibold">{totals.items}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.totalCbm")}</span>
                    <span className="font-semibold text-teal">{round(totals.cbm, 4)} m³</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.cubicFeet")}</span>
                    <span className="font-semibold">{round(cbmToCubicFeet(totals.cbm), 2)} ft³</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.liters")}</span>
                    <span className="font-semibold">{round(cbmToLiters(totals.cbm), 1)} L</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.actualWeight")}</span>
                    <span className="font-semibold">{round(totals.actualWeight, 1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">{t("tools.volWeight")}</span>
                    <span className="font-semibold">{round(totals.volWeight, 1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-teal/5 rounded-lg px-3 -mx-1">
                    <span className="text-sm font-medium flex items-center gap-1"><Scale className="h-3.5 w-3.5" /> {t("tools.chargeableWeight")}</span>
                    <span className="text-lg font-bold text-teal">{round(chargeableWt, 1)} kg</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p><strong>CBM</strong> = L × W × H ÷ 1,000,000 (cm)</p>
                  <p><strong>Vol. Weight</strong> = L × W × H ÷ 6,000 (cm)</p>
                  <p><strong>Chargeable</strong> = max(actual, volumetric)</p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button className="w-full bg-teal hover:bg-teal/90" disabled={validItems.length === 0} onClick={handleGetQuote}>
                    Get Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/tools/3d-visualizer" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <Box className="h-4 w-4" /> 3D Container Visualizer
                    </Button>
                  </Link>
                  <Link href="/tools/revenue-calculator" className="block">
                    <Button variant="outline" className="w-full gap-2">
                      <BarChart3 className="h-4 w-4" /> Revenue Calculator
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
