"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, Package, Ruler, Ship, User,
  Check, Info, Plus, Minus
} from "lucide-react";
import { FURNITURE_PRESETS, calculateShippingQuote, type ShippingQuote } from "@/lib/shipping-calculator";
import { formatCurrency } from "@/lib/airwallex";
import { toast } from "sonner";

type FurnitureItem = {
  name: string;
  quantity: number;
  cbm: number;
  weightKG: number;
};

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [customItem, setCustomItem] = useState({ name: "", lengthCm: "", widthCm: "", heightCm: "", weightKG: "" });
  const [shippingMethod, setShippingMethod] = useState<ShippingQuote["method"]>("lcl");
  const [addOns, setAddOns] = useState({ insurance: false, lastMile: true, whiteGlove: false });
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totalCBM = items.reduce((sum, i) => sum + i.cbm * i.quantity, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.weightKG * i.quantity, 0);
  // Estimate cargo value (rough: $500/CBM average)
  const estimatedCargoValue = totalCBM * 500;

  const addPresetItem = (preset: typeof FURNITURE_PRESETS[0]) => {
    const existing = items.find((i) => i.name === preset.name);
    if (existing) {
      setItems(items.map((i) => i.name === preset.name ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setItems([...items, { name: preset.name, quantity: 1, cbm: preset.cbm, weightKG: preset.weightKG }]);
    }
  };

  const addCustomItem = () => {
    const l = parseFloat(customItem.lengthCm) / 100;
    const w = parseFloat(customItem.widthCm) / 100;
    const h = parseFloat(customItem.heightCm) / 100;
    const weight = parseFloat(customItem.weightKG);
    if (!customItem.name || isNaN(l) || isNaN(w) || isNaN(h) || isNaN(weight)) {
      toast.error("Please fill in all fields for custom item.");
      return;
    }
    const cbm = Math.round(l * w * h * 100) / 100;
    setItems([...items, { name: customItem.name, quantity: 1, cbm, weightKG: weight }]);
    setCustomItem({ name: "", lengthCm: "", widthCm: "", heightCm: "", weightKG: "" });
  };

  const removeItem = (name: string) => {
    setItems(items.filter((i) => i.name !== name));
  };

  const updateQuantity = (name: string, delta: number) => {
    setItems(items.map((i) => {
      if (i.name !== name) return i;
      const newQty = i.quantity + delta;
      return newQty > 0 ? { ...i, quantity: newQty } : i;
    }));
  };

  const calculateQuote = () => {
    const q = calculateShippingQuote(shippingMethod, totalCBM, totalWeight, estimatedCargoValue, addOns.insurance, addOns.lastMile);
    setQuote(q);
  };

  const handleSubmit = async () => {
    if (!contact.name || !contact.email) {
      toast.error("Please fill in your name and email.");
      return;
    }
    setSubmitted(true);
    toast.success("Quote request submitted! We'll send a detailed quote within 24 hours.");
  };

  const canProceed = () => {
    switch (step) {
      case 1: return items.length > 0;
      case 2: return totalCBM > 0;
      case 3: return true;
      case 4: return contact.name && contact.email;
      default: return false;
    }
  };

  const nextStep = () => {
    if (step === 3) calculateQuote();
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Free Estimate</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">Shipping Quote Calculator</h1>
            <p className="mt-3 text-slate-300">Get an instant estimate in under 2 minutes</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  s <= step ? "bg-teal text-white" : "bg-muted text-muted-foreground"
                }`}>
                  {s < step ? <Check className="h-5 w-5" /> : s}
                </div>
                {s < 4 && <div className={`h-0.5 w-12 sm:w-20 transition-all ${s < step ? "bg-teal" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Select Items */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">What are you shipping?</h2>
                <p className="text-muted-foreground mb-6">Select furniture items or add custom pieces.</p>

                {/* Preset Items Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {FURNITURE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => addPresetItem(preset)}
                      className="group rounded-xl border border-border/50 p-3 text-center transition-all hover:border-teal/50 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="text-2xl">{preset.icon}</span>
                      <p className="mt-1 text-xs font-medium leading-tight">{preset.name}</p>
                      <p className="text-xs text-muted-foreground">{preset.cbm} CBM</p>
                    </button>
                  ))}
                </div>

                {/* Custom Item */}
                <div className="mt-6 rounded-xl border p-4 space-y-3">
                  <h3 className="font-medium text-sm flex items-center gap-2"><Ruler className="h-4 w-4 text-teal" /> Custom Item</h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <Input placeholder="Item name" value={customItem.name} onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })} />
                    <Input placeholder="L (cm)" type="number" value={customItem.lengthCm} onChange={(e) => setCustomItem({ ...customItem, lengthCm: e.target.value })} />
                    <Input placeholder="W (cm)" type="number" value={customItem.widthCm} onChange={(e) => setCustomItem({ ...customItem, widthCm: e.target.value })} />
                    <Input placeholder="H (cm)" type="number" value={customItem.heightCm} onChange={(e) => setCustomItem({ ...customItem, heightCm: e.target.value })} />
                    <Input placeholder="Weight (kg)" type="number" value={customItem.weightKG} onChange={(e) => setCustomItem({ ...customItem, weightKG: e.target.value })} />
                  </div>
                  <Button variant="outline" size="sm" onClick={addCustomItem}><Plus className="mr-1 h-4 w-4" /> Add Custom Item</Button>
                </div>

                {/* Selected Items */}
                {items.length > 0 && (
                  <div className="mt-6 space-y-2">
                    <h3 className="font-medium text-sm">Selected Items ({items.length})</h3>
                    {items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.cbm} CBM · {item.weightKG} kg each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.name, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.name, 1)}><Plus className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive text-xs" onClick={() => removeItem(item.name)}>Remove</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Summary & Review */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">Cargo Summary</h2>
                <p className="text-muted-foreground mb-6">Review your items and total dimensions.</p>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {items.map((item) => (
                      <div key={item.name} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="text-muted-foreground">{(item.cbm * item.quantity).toFixed(1)} CBM · {item.weightKG * item.quantity} kg</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span className="text-teal">{totalCBM.toFixed(1)} CBM · {totalWeight} kg</span>
                    </div>
                    <div className="rounded-lg bg-teal/5 p-4 text-sm">
                      <p className="flex items-center gap-2 font-medium text-teal">
                        <Info className="h-4 w-4" />
                        {totalCBM <= 15
                          ? "Your cargo fits well in a shared container (LCL)."
                          : totalCBM <= 28
                          ? "Consider a 20ft Full Container (FCL) for better value."
                          : totalCBM <= 58
                          ? "A 40ft Container would be the best value for this volume."
                          : "A 40ft High Cube Container is recommended for this volume."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Shipping Method */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">Choose Shipping Method</h2>
                <p className="text-muted-foreground mb-6">Select your preferred shipping option and add-ons.</p>

                <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as ShippingQuote["method"])} className="space-y-3">
                  {[
                    { value: "lcl", label: "LCL Sea Freight", desc: "Shared container · Pay per CBM", transit: "25-35 days", price: `~${formatCurrency(totalCBM * 200)}/est.` },
                    { value: "fcl-20", label: "20ft Container (FCL)", desc: "Dedicated 28 CBM container", transit: "20-30 days", price: "$2,500-$4,000" },
                    { value: "fcl-40", label: "40ft Container (FCL)", desc: "Dedicated 58 CBM container", transit: "20-30 days", price: "$4,000-$6,500" },
                    { value: "fcl-40hq", label: "40ft High Cube (FCL)", desc: "Dedicated 68 CBM container", transit: "20-30 days", price: "$4,500-$7,000" },
                  ].map((opt) => (
                    <label key={opt.value} className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${shippingMethod === opt.value ? "border-teal bg-teal/5 shadow-sm" : "border-border/50 hover:border-teal/30"}`}>
                      <RadioGroupItem value={opt.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">{opt.label}</p>
                          <span className="text-sm font-medium text-teal">{opt.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        <p className="mt-1 text-xs text-muted-foreground">🕐 {opt.transit}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>

                {/* Add-ons */}
                <div className="mt-8 space-y-3">
                  <h3 className="font-medium">Add-on Services</h3>
                  {[
                    { key: "insurance" as const, label: "Cargo Insurance", desc: "Full replacement value coverage", price: `+${formatCurrency(estimatedCargoValue * 0.02)}` },
                    { key: "lastMile" as const, label: "Last-Mile Delivery", desc: "Seattle metro area door delivery", price: "+$400" },
                    { key: "whiteGlove" as const, label: "White Glove Setup", desc: "Indoor placement & assembly", price: "+$200" },
                  ].map((addon) => (
                    <label key={addon.key} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                      <Checkbox checked={addOns[addon.key]} onCheckedChange={(checked) => setAddOns({ ...addOns, [addon.key]: !!checked })} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{addon.label}</p>
                        <p className="text-xs text-muted-foreground">{addon.desc}</p>
                      </div>
                      <span className="text-sm text-teal font-medium">{addon.price}</span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Contact & Submit */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!submitted ? (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Your Estimated Quote</h2>
                    <p className="text-muted-foreground mb-6">Review your quote and submit to receive a detailed proposal.</p>

                    {quote && (
                      <Card className="mb-8 border-teal/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ship className="h-5 w-5 text-teal" /> Quote Estimate
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between text-sm"><span>Base Freight ({quote.method.toUpperCase()})</span><span>{formatCurrency(quote.baseFreight)}</span></div>
                          <div className="flex justify-between text-sm"><span>Export Clearance</span><span>{formatCurrency(quote.exportClearance)}</span></div>
                          <div className="flex justify-between text-sm"><span>Destination Port Fees</span><span>{formatCurrency(quote.destinationFees)}</span></div>
                          <div className="flex justify-between text-sm"><span>Customs Duty (est. 3%)</span><span>{formatCurrency(quote.customs)}</span></div>
                          {quote.lastMile > 0 && <div className="flex justify-between text-sm"><span>Last-Mile Delivery</span><span>{formatCurrency(quote.lastMile)}</span></div>}
                          {quote.insurance > 0 && <div className="flex justify-between text-sm"><span>Cargo Insurance</span><span>{formatCurrency(quote.insurance)}</span></div>}
                          <Separator />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Estimated Total</span>
                            <span className="text-teal">{formatCurrency(quote.total)}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">🕐 Estimated transit: {quote.transitDays}</p>
                          <p className="text-xs text-muted-foreground">* This is an estimate. Final quote may vary based on actual dimensions and current rates.</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Contact Form */}
                    <Card>
                      <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-teal" /> Contact Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div><Label htmlFor="q-name">Full Name *</Label><Input id="q-name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your name" className="mt-1" /></div>
                          <div><Label htmlFor="q-email">Email *</Label><Input id="q-email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="you@example.com" className="mt-1" /></div>
                        </div>
                        <div><Label htmlFor="q-phone">Phone</Label><Input id="q-phone" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+1 (206) 555-0000" className="mt-1" /></div>
                        <Button onClick={handleSubmit} className="w-full bg-teal text-white hover:bg-teal/90" size="lg">
                          Submit Quote Request <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
                      <Check className="h-10 w-10 text-teal" />
                    </div>
                    <h2 className="text-3xl font-bold">Quote Submitted!</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Thank you, {contact.name}! We&apos;ll send a detailed quote to <strong>{contact.email}</strong> within 24 hours.
                    </p>
                    {quote && (
                      <p className="text-lg font-semibold text-teal">
                        Estimated: {formatCurrency(quote.total)}
                      </p>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {!submitted && (
            <div className="mt-8 flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              {step < 4 && (
                <Button onClick={nextStep} disabled={!canProceed()} className="bg-navy text-white hover:bg-navy/90">
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Live Summary Sidebar (Desktop) */}
          {items.length > 0 && !submitted && (
            <div className="mt-8 rounded-xl border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">📦 Cargo Summary</p>
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div><p className="text-2xl font-bold text-navy">{items.reduce((s, i) => s + i.quantity, 0)}</p><p className="text-muted-foreground">Items</p></div>
                <div><p className="text-2xl font-bold text-teal">{totalCBM.toFixed(1)}</p><p className="text-muted-foreground">Total CBM</p></div>
                <div><p className="text-2xl font-bold text-gold">{totalWeight}</p><p className="text-muted-foreground">Total kg</p></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
