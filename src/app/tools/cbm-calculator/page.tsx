"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Plus, Trash2, Box, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

export default function CBMCalculatorPage() {
  const [items, setItems] = useState<Item[]>([
    { id: nextId++, name: "Item 1", length: "", width: "", height: "", weight: "", qty: "1" },
  ]);

  const addItem = () => {
    setItems([...items, { id: nextId++, name: `Item ${items.length + 1}`, length: "", width: "", height: "", weight: "", qty: "1" }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof Item, value: string) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const calculations = items.map((item) => {
    const l = parseFloat(item.length) || 0;
    const w = parseFloat(item.width) || 0;
    const h = parseFloat(item.height) || 0;
    const wt = parseFloat(item.weight) || 0;
    const qty = parseInt(item.qty) || 1;
    const cbmPerUnit = (l * w * h) / 1_000_000;
    const volWeight = (l * w * h) / 6000;
    return {
      cbmPerUnit,
      cbmTotal: cbmPerUnit * qty,
      volWeightPerUnit: volWeight,
      volWeightTotal: volWeight * qty,
      actualWeightTotal: wt * qty,
      qty,
    };
  });

  const totals = calculations.reduce(
    (acc, c) => ({
      cbm: acc.cbm + c.cbmTotal,
      volWeight: acc.volWeight + c.volWeightTotal,
      actualWeight: acc.actualWeight + c.actualWeightTotal,
      items: acc.items + c.qty,
    }),
    { cbm: 0, volWeight: 0, actualWeight: 0, items: 0 }
  );

  const chargeableWeight = Math.max(totals.volWeight, totals.actualWeight);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Free Tool</Badge>
            <h1 className="text-4xl font-bold mb-4">CBM Calculator</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Calculate cubic meters (CBM), volumetric weight, and chargeable weight
              for your shipment. Used by freight forwarders worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        className="font-medium border-0 p-0 h-auto text-base focus-visible:ring-0 max-w-[200px]"
                      />
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                        <Input type="number" placeholder="0" value={item.length} onChange={(e) => updateItem(item.id, "length", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                        <Input type="number" placeholder="0" value={item.width} onChange={(e) => updateItem(item.id, "width", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Height (cm)</Label>
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
                      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                        <span>CBM/unit: <strong className="text-foreground">{calculations[idx].cbmPerUnit.toFixed(4)}</strong></span>
                        <span>Vol. weight: <strong className="text-foreground">{calculations[idx].volWeightPerUnit.toFixed(1)} kg</strong></span>
                        <span>Total CBM: <strong className="text-teal">{calculations[idx].cbmTotal.toFixed(4)}</strong></span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <Button variant="outline" onClick={addItem} className="w-full border-dashed">
              <Plus className="h-4 w-4 mr-2" /> Add Another Item
            </Button>
          </div>

          {/* Results Summary */}
          <div className="space-y-4">
            <Card className="sticky top-24 border-teal/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-teal" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total Items</span>
                    <span className="font-semibold">{totals.items}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Total CBM</span>
                    <span className="font-semibold text-teal">{totals.cbm.toFixed(4)} m³</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Actual Weight</span>
                    <span className="font-semibold">{totals.actualWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Volumetric Weight</span>
                    <span className="font-semibold">{totals.volWeight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-teal/5 rounded-lg px-3 -mx-1">
                    <span className="text-sm font-medium">Chargeable Weight</span>
                    <span className="text-lg font-bold text-teal">{chargeableWeight.toFixed(1)} kg</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                  <p><strong>CBM</strong> = L × W × H ÷ 1,000,000 (in cm)</p>
                  <p><strong>Vol. Weight</strong> = L × W × H ÷ 6,000 (in cm)</p>
                  <p><strong>Chargeable</strong> = max(actual, volumetric)</p>
                </div>

                <Link href="/quote" className="block pt-2">
                  <Button className="w-full bg-teal hover:bg-teal/90">
                    Get Shipping Quote <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Box className="h-4 w-4 text-gold" /> Quick Reference
                </h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>20ft Container: ~33 CBM</p>
                  <p>40ft Container: ~67 CBM</p>
                  <p>40ft HC Container: ~76 CBM</p>
                  <p>LCL minimum: typically 1 CBM</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
