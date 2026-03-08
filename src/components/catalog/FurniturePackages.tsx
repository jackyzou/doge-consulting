"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Package, ArrowRight, Check, ShoppingCart, Container,
  ChevronDown, ChevronUp, Scale, Ruler, DollarSign, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STYLES, HOME_SIZES, generatePackage, type FurniturePackage } from "@/lib/furniture-packages";
import { useRouter } from "next/navigation";

export default function FurniturePackages() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const pkg: FurniturePackage | null = useMemo(() => {
    if (!selectedStyle || !selectedSize) return null;
    return generatePackage(selectedStyle, selectedSize);
  }, [selectedStyle, selectedSize]);

  const handleAddToQuote = () => {
    if (!pkg) return;
    // Store package items in sessionStorage for the quote page to pick up
    const quoteItems = pkg.items.map((item) => ({
      name: `${item.name} (${pkg.style})`,
      quantity: item.qty,
      lengthCm: item.lengthCm,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      weightKg: item.weightKg,
      unitPrice: item.priceUsd,
      cbm: (item.lengthCm * item.widthCm * item.heightCm) / 1_000_000,
    }));
    sessionStorage.setItem("catalogPackageItems", JSON.stringify(quoteItems));
    sessionStorage.setItem("catalogPackageMeta", JSON.stringify({
      style: pkg.style,
      homeSize: pkg.homeSize,
      containerType: pkg.containerType,
    }));
    router.push("/quote?source=furniture-package");
  };

  // US retail comparison (roughly 3x China-direct for furniture)
  const usRetailEstimate = pkg ? Math.round(pkg.totalPrice * 3) : 0;

  return (
    <div className="space-y-8">
      {/* Style Selector */}
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal" /> Step 1: Choose Your Style
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Select the interior design style that matches your taste</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`rounded-xl border text-left transition-all overflow-hidden ${
                selectedStyle === style.id
                  ? "border-teal shadow-lg ring-2 ring-teal/20"
                  : "border-border/50 hover:border-teal/30 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <div className="relative h-28 w-full bg-slate-100">
                <img src={style.image} alt={style.label} className="w-full h-full object-cover" loading="lazy" />
                {selectedStyle === style.id && (
                  <div className="absolute inset-0 bg-teal/20 flex items-center justify-center">
                    <div className="bg-teal rounded-full p-1"><Check className="h-4 w-4 text-white" /></div>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="font-semibold text-sm">{style.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{style.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Home Size Selector */}
      <div>
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Home className="h-5 w-5 text-teal" /> Step 2: Choose Your Home Size
        </h3>
        <p className="text-sm text-muted-foreground mb-4">We&apos;ll configure every piece of furniture you need</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {HOME_SIZES.map((size) => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`rounded-xl border text-left transition-all overflow-hidden ${
                selectedSize === size.id
                  ? "border-teal shadow-lg ring-2 ring-teal/20"
                  : "border-border/50 hover:border-teal/30 hover:shadow-md hover:-translate-y-0.5"
              }`}
            >
              <div className="relative h-24 w-full bg-slate-100">
                <img src={size.image} alt={size.label} className="w-full h-full object-cover" loading="lazy" />
                {selectedSize === size.id && (
                  <div className="absolute inset-0 bg-teal/20 flex items-center justify-center">
                    <div className="bg-teal rounded-full p-1"><Check className="h-4 w-4 text-white" /></div>
                  </div>
                )}
              </div>
              <div className="p-2.5">
                <p className="font-semibold text-sm">{size.rooms}</p>
                <p className="text-[10px] text-muted-foreground">{size.label}</p>
                <p className="text-[10px] text-muted-foreground">{size.sqft}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Package Result */}
      <AnimatePresence>
        {pkg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-teal/30 shadow-xl overflow-hidden">
              {/* Package header */}
              <div className="bg-gradient-to-r from-navy to-navy-light p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge className="bg-teal/20 text-teal-light border-teal/30 mb-2">Complete Package</Badge>
                    <h3 className="text-xl font-bold">{pkg.style} — {pkg.homeSize}</h3>
                    <p className="text-sm text-slate-300 mt-1">{pkg.items.length} items · Everything you need, one container</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400 line-through">${usRetailEstimate.toLocaleString()} US Retail</p>
                    <p className="text-3xl font-bold text-teal">${pkg.totalPrice.toLocaleString()}</p>
                    <p className="text-xs text-teal-light">China-direct · Save {Math.round((1 - pkg.totalPrice / usRetailEstimate) * 100)}%</p>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-5">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-bold">{pkg.items.reduce((s, i) => s + i.qty, 0)} Pieces</p>
                      <p className="text-[10px] text-muted-foreground">Total items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-bold">{pkg.totalCbm} CBM</p>
                      <p className="text-[10px] text-muted-foreground">Total volume</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-bold">{pkg.totalWeight.toLocaleString()} kg</p>
                      <p className="text-[10px] text-muted-foreground">Total weight</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Container className="h-5 w-5 text-teal" />
                    <div>
                      <p className="text-sm font-bold">{pkg.containerType}</p>
                      <p className="text-[10px] text-muted-foreground">Container type</p>
                    </div>
                  </div>
                </div>

                {/* Container fit badge */}
                <div className="bg-teal/5 border border-teal/20 rounded-lg p-3 flex items-center gap-2">
                  <Check className="h-5 w-5 text-teal shrink-0" />
                  <p className="text-sm">
                    <strong className="text-teal">Fits in one {pkg.containerType} container.</strong>{" "}
                    Shipped from Shenzhen to your door — unpack and furnish your entire home.
                  </p>
                </div>

                {/* Expandable item list */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-sm font-medium text-teal hover:text-teal/80 transition-colors"
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showDetails ? "Hide" : "Show"} all {pkg.items.length} items
                </button>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium">Item</th>
                              <th className="text-center px-2 py-2 font-medium">Qty</th>
                              <th className="text-right px-2 py-2 font-medium">Dimensions</th>
                              <th className="text-right px-4 py-2 font-medium">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.items.map((item, i) => (
                              <tr key={i} className="border-t hover:bg-slate-50/50">
                                <td className="px-4 py-2 font-medium">{item.name}</td>
                                <td className="text-center px-2 py-2 text-muted-foreground">{item.qty}×</td>
                                <td className="text-right px-2 py-2 text-xs text-muted-foreground">
                                  {item.lengthCm}×{item.widthCm}×{item.heightCm} cm
                                </td>
                                <td className="text-right px-4 py-2 font-medium">${(item.priceUsd * item.qty).toLocaleString()}</td>
                              </tr>
                            ))}
                            <tr className="border-t-2 font-bold">
                              <td className="px-4 py-3">Total</td>
                              <td className="text-center px-2 py-3">{pkg.items.reduce((s, i) => s + i.qty, 0)}×</td>
                              <td className="text-right px-2 py-3 text-xs">{pkg.totalCbm} CBM</td>
                              <td className="text-right px-4 py-3 text-teal">${pkg.totalPrice.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button onClick={handleAddToQuote} size="lg" className="bg-teal hover:bg-teal/90 text-white flex-1">
                    <ShoppingCart className="h-5 w-5 mr-2" /> Add Package to Quote
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => { setShowDetails(true); }}>
                    <DollarSign className="h-5 w-5 mr-2" /> Customize & Adjust Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
