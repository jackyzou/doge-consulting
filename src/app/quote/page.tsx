"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, ArrowRight, Package, Ruler, Ship, User,
  Check, Info, Plus, Minus, Warehouse, Truck
} from "lucide-react";
import {
  PRODUCT_PRESETS,
  ZONES,
  WAREHOUSE_CITIES,
  RMB_TO_USD,
  calculateDoorToDoorQuote,
  calculateWarehousePickupQuote,
  type ShippingQuote,
  type DeliveryType,
} from "@/lib/shipping-calculator";
import { toast } from "sonner";

type ProductItem = {
  name: string;
  quantity: number;
  cbm: number;
  weightKG: number;
};

function formatRMB(val: number) {
  return `¥${val.toLocaleString("en-US")}`;
}

function formatUSD(val: number) {
  return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function QuotePage() {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [customItem, setCustomItem] = useState({ name: "", lengthCm: "", widthCm: "", heightCm: "", weightKG: "" });

  // Delivery & destination
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("door-to-door");
  const [selectedZone, setSelectedZone] = useState("west-2"); // default WA/OR/CA
  const [selectedCity, setSelectedCity] = useState("la");

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totalCBM = items.reduce((sum, i) => sum + i.cbm * i.quantity, 0);
  const totalWeight = items.reduce((sum, i) => sum + i.weightKG * i.quantity, 0);
  // Calculate total volumetric weight from CBM (CBM * 1e6 cm³ / 6000)
  const totalVolumetricKG = (totalCBM * 1_000_000) / 6000;

  const addPresetItem = (preset: (typeof PRODUCT_PRESETS)[0]) => {
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
    if (deliveryType === "door-to-door") {
      setQuote(calculateDoorToDoorQuote(selectedZone, totalWeight, totalVolumetricKG));
    } else {
      setQuote(calculateWarehousePickupQuote(selectedCity, totalWeight, totalVolumetricKG));
    }
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
      case 2: return true;
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
            <p className="mt-3 text-slate-300">Get an instant estimate for shipping from China to the USA</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-10 flex items-center justify-center gap-2">
            {[
              { n: 1, label: "Items" },
              { n: 2, label: "Destination" },
              { n: 3, label: "Summary" },
              { n: 4, label: "Quote" },
            ].map((s) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    s.n <= step ? "bg-teal text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.n < step ? <Check className="h-5 w-5" /> : s.n}
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground hidden sm:block">{s.label}</span>
                </div>
                {s.n < 4 && <div className={`h-0.5 w-8 sm:w-16 transition-all ${s.n < step ? "bg-teal" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ═══ Step 1: Select Items ═══ */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">What are you shipping?</h2>
                <p className="text-muted-foreground mb-6">Select product presets or add custom items with dimensions.</p>

                {/* Preset Grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {PRODUCT_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => addPresetItem(preset)}
                      className="group rounded-xl border border-border/50 p-3 text-center transition-all hover:border-teal/50 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="text-2xl">{preset.icon}</span>
                      <p className="mt-1 text-xs font-medium leading-tight">{preset.name}</p>
                      <p className="text-xs text-muted-foreground">{preset.weightKG} kg</p>
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

            {/* ═══ Step 2: Delivery Type & Destination ═══ */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">Choose Delivery Type & Destination</h2>
                <p className="text-muted-foreground mb-6">Select how you&apos;d like to receive your shipment in the USA.</p>

                {/* Delivery Type Toggle */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button
                    onClick={() => setDeliveryType("door-to-door")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${
                      deliveryType === "door-to-door"
                        ? "border-teal bg-teal/5 shadow-md"
                        : "border-border/50 hover:border-teal/30"
                    }`}
                  >
                    <Truck className={`h-8 w-8 ${deliveryType === "door-to-door" ? "text-teal" : "text-muted-foreground"}`} />
                    <p className="font-semibold">Door-to-Door</p>
                    <p className="text-xs text-muted-foreground text-center">Delivered to your address anywhere in the USA</p>
                  </button>
                  <button
                    onClick={() => setDeliveryType("warehouse-pickup")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-all ${
                      deliveryType === "warehouse-pickup"
                        ? "border-teal bg-teal/5 shadow-md"
                        : "border-border/50 hover:border-teal/30"
                    }`}
                  >
                    <Warehouse className={`h-8 w-8 ${deliveryType === "warehouse-pickup" ? "text-teal" : "text-muted-foreground"}`} />
                    <p className="font-semibold">Warehouse Pickup</p>
                    <p className="text-xs text-muted-foreground text-center">Pick up from a US warehouse (lower rates)</p>
                  </button>
                </div>

                {/* Zone / City Selection */}
                {deliveryType === "door-to-door" ? (
                  <div>
                    <h3 className="font-medium mb-3">Select Destination Zone</h3>
                    <RadioGroup value={selectedZone} onValueChange={setSelectedZone} className="space-y-2">
                      {ZONES.map((zone) => (
                        <label
                          key={zone.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                            selectedZone === zone.id ? "border-teal bg-teal/5" : "border-border/50 hover:border-teal/30"
                          }`}
                        >
                          <RadioGroupItem value={zone.id} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{zone.label}</p>
                            <p className="text-xs text-muted-foreground">
                              🕐 {zone.transitDays} · Last-mile surcharge: {formatRMB(zone.lastMileSurchargeRMB)} (~{formatUSD(zone.lastMileSurchargeRMB / RMB_TO_USD)})
                            </p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium mb-3">Select Pickup City</h3>
                    <RadioGroup value={selectedCity} onValueChange={setSelectedCity} className="space-y-2">
                      {WAREHOUSE_CITIES.map((city) => (
                        <label
                          key={city.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                            selectedCity === city.id ? "border-teal bg-teal/5" : "border-border/50 hover:border-teal/30"
                          }`}
                        >
                          <RadioGroupItem value={city.id} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{city.label}</p>
                            <p className="text-xs text-muted-foreground">{city.labelZh}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                )}
              </motion.div>
            )}

            {/* ═══ Step 3: Cargo Summary ═══ */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-2xl font-bold mb-2">Cargo Summary</h2>
                <p className="text-muted-foreground mb-6">Review your items, weights, and destination before getting your quote.</p>

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    {items.map((item) => (
                      <div key={item.name} className="flex justify-between text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="text-muted-foreground">{(item.cbm * item.quantity).toFixed(1)} CBM · {item.weightKG * item.quantity} kg</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Total CBM</span><span className="font-medium">{totalCBM.toFixed(1)} CBM</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Actual Weight</span><span className="font-medium">{totalWeight} kg</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Volumetric Weight</span><span className="font-medium">{totalVolumetricKG.toFixed(1)} kg</span></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chargeable</span>
                          <span className="font-bold text-teal">{Math.max(totalWeight, totalVolumetricKG).toFixed(1)} kg</span>
                        </div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium">{deliveryType === "door-to-door" ? "Door-to-Door" : "Warehouse Pickup"}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="font-medium text-teal">{
                          deliveryType === "door-to-door"
                            ? ZONES.find((z) => z.id === selectedZone)?.label
                            : WAREHOUSE_CITIES.find((c) => c.id === selectedCity)?.label
                        }</span></div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-teal/5 p-4 text-sm">
                      <p className="flex items-center gap-2 text-teal">
                        <Info className="h-4 w-4" />
                        Chargeable weight = max(actual, volumetric). Volumetric = (L×W×H cm) ÷ 6000.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ═══ Step 4: Quote Result & Contact ═══ */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!submitted ? (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Your Shipping Quote</h2>
                    <p className="text-muted-foreground mb-6">Review your estimated cost and submit for a detailed proposal.</p>

                    {quote && (
                      <Card className="mb-8 border-teal/30">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Ship className="h-5 w-5 text-teal" /> Shipping Estimate
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className="font-medium">{quote.deliveryType === "door-to-door" ? "Door-to-Door" : "Warehouse Pickup"}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="font-medium">{quote.destinationLabel}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Weight Tier</span><span className="font-medium">{quote.tierLabel}</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Chargeable Weight</span><span className="font-medium">{quote.chargeableWeightKG} kg</span></div>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex justify-between"><span className="text-muted-foreground">Rate</span><span className="font-medium">{formatRMB(quote.ratePerKG_RMB)}/kg (~{formatUSD(quote.ratePerKG_RMB / RMB_TO_USD)}/kg)</span></div>
                              <div className="flex justify-between"><span className="text-muted-foreground">Freight</span><span className="font-medium">{formatRMB(quote.freightRMB)}</span></div>
                              {quote.lastMileSurchargeRMB > 0 && (
                                <div className="flex justify-between"><span className="text-muted-foreground">Last-Mile Surcharge</span><span className="font-medium">{formatRMB(quote.lastMileSurchargeRMB)}</span></div>
                              )}
                              <div className="flex justify-between"><span className="text-muted-foreground">Transit</span><span className="font-medium">🕐 {quote.transitDays}</span></div>
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-sm text-muted-foreground">Estimated Total</p>
                              <p className="text-2xl font-bold text-teal">{formatUSD(quote.totalUSD)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">In RMB</p>
                              <p className="text-lg font-semibold text-gold">{formatRMB(quote.totalRMB)}</p>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            * Estimate based on current rates (1 USD ≈ {RMB_TO_USD} RMB). Final quote may vary based on actual dimensions, weight verification, and current exchange rates.
                          </p>
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
                      <div className="space-y-1">
                        <p className="text-lg font-semibold text-teal">Estimated: {formatUSD(quote.totalUSD)}</p>
                        <p className="text-sm text-gold">{formatRMB(quote.totalRMB)}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
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

          {/* Live Summary */}
          {items.length > 0 && !submitted && (
            <div className="mt-8 rounded-xl border bg-muted/50 p-4">
              <p className="text-sm font-medium mb-2">📦 Cargo Summary</p>
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div><p className="text-2xl font-bold text-navy">{items.reduce((s, i) => s + i.quantity, 0)}</p><p className="text-muted-foreground">Items</p></div>
                <div><p className="text-2xl font-bold text-teal">{totalCBM.toFixed(1)}</p><p className="text-muted-foreground">CBM</p></div>
                <div><p className="text-2xl font-bold text-gold">{totalWeight}</p><p className="text-muted-foreground">Actual kg</p></div>
                <div><p className="text-2xl font-bold text-navy">{totalVolumetricKG.toFixed(0)}</p><p className="text-muted-foreground">Vol. kg</p></div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
