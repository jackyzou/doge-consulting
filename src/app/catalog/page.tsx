"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search, ArrowRight, Package, Sofa, Cpu, Lightbulb, Wrench,
  ShowerHead, Factory, Shirt, Sparkles, ExternalLink, ShoppingCart,
  Loader2, Brain,
} from "lucide-react";
import Link from "next/link";
import ProductMatcher from "@/components/catalog/ProductMatcher";
import FurniturePackages from "@/components/catalog/FurniturePackages";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unitPrice: number;
  unit: string;
  imageUrl: string | null;
  linkUrl: string | null;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  weightKg: number | null;
}

const CATEGORIES = [
  { id: "consulting", label: "Consulting & Customization", icon: Brain, emoji: "🎯", color: "bg-teal/10 text-teal", desc: "AI-powered sourcing, custom manufacturing, product development consulting" },
  { id: "furniture", label: "Furniture", icon: Sofa, emoji: "🪑", color: "bg-amber-500/10 text-amber-600", desc: "Sofas, tables, beds, chairs, cabinets — factory-direct from Shenzhen & Foshan" },
  { id: "home-goods", label: "Home Goods & Décor", icon: Package, emoji: "🏠", color: "bg-blue-500/10 text-blue-600", desc: "Rugs, mirrors, art, candles, storage, kitchen accessories" },
  { id: "electronics", label: "Electronics & Smart Home", icon: Cpu, emoji: "📱", color: "bg-purple-500/10 text-purple-600", desc: "Smart devices, audio, lighting controls, security cameras, appliances" },
  { id: "lighting", label: "Lighting & Fixtures", icon: Lightbulb, emoji: "💡", color: "bg-yellow-500/10 text-yellow-600", desc: "Chandeliers, pendant lights, LED strips, floor lamps, wall sconces" },
  { id: "kitchen-bath", label: "Kitchen & Bath", icon: ShowerHead, emoji: "🚿", color: "bg-cyan-500/10 text-cyan-600", desc: "Vanities, faucets, tiles, countertops, cabinetry, fixtures" },
  { id: "industrial", label: "Industrial & Commercial", icon: Factory, emoji: "🏭", color: "bg-slate-500/10 text-slate-600", desc: "Office furniture, commercial equipment, industrial supplies, bulk orders" },
  { id: "textiles", label: "Textiles & Soft Furnishings", icon: Shirt, emoji: "🧵", color: "bg-pink-500/10 text-pink-600", desc: "Bedding, curtains, upholstery fabric, towels, cushions from Guangzhou" },
];

const CATEGORY_ICONS: Record<string, string> = {
  furniture: "🪑", electronics: "📱", "home-goods": "🏠", lighting: "💡",
  "kitchen-bath": "🚿", industrial: "🏭", textiles: "🧵", consulting: "🎯",
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"browse" | "matcher" | "packages">("browse");

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const productCategories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ══════════ HERO ══════════ */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">AI-Powered Product Sourcing</Badge>
            <h1 className="text-4xl font-bold sm:text-5xl">
              Find It in the US. <span className="text-teal">Get It Cheaper from China.</span>
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">
              Paste a product link or upload a photo — our AI will find the same product from China&apos;s factories
              at 20–60% less than US retail. Or explore our curated catalog and furniture room packages.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-12 pb-20">

        {/* ══════════ AI PRODUCT MATCHER (prominent) ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <ProductMatcher />
        </motion.div>

        {/* ══════════ CATEGORY GRID ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="text-center mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Browse by Category</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Products & Services</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                    setActiveSection("browse");
                    // Scroll to products section
                    document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`w-full p-5 rounded-2xl border text-left transition-all hover:shadow-lg hover:-translate-y-1 ${
                    selectedCategory === cat.id
                      ? "border-teal bg-teal/5 shadow-md ring-2 ring-teal/20"
                      : "border-border/50 bg-white hover:border-teal/30"
                  }`}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <p className="font-semibold text-sm mt-2">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{cat.desc}</p>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══════════ FURNITURE ROOM PACKAGES ══════════ */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="rounded-[28px] border border-border/50 bg-white p-6 sm:p-8 shadow-sm">
            <div className="text-center mb-8">
              <Badge className="mb-3 bg-teal/10 text-teal border-teal/20">One-Stop Home Furnishing</Badge>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Shop Furniture by Style — <span className="text-teal">Complete Room Packages</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Pick your style and home size. We&apos;ll configure every piece of furniture you need — from sofa to nightstand —
                packed into a single container and shipped from Shenzhen to your door. Unpack and you&apos;re home.
              </p>
            </div>
            <FurniturePackages />
          </div>
        </motion.div>

        {/* ══════════ BROWSE PRODUCTS ══════════ */}
        <div id="products-section">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-center mb-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal">Catalog</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Browse Products</h2>
            </div>

            {/* Search + category filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={!selectedCategory ? "default" : "outline"}
                  size="sm"
                  className={!selectedCategory ? "bg-teal hover:bg-teal/90" : ""}
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {productCategories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    className={selectedCategory === cat ? "bg-teal hover:bg-teal/90" : ""}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_ICONS[cat] || "📦"} {cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Button>
                ))}
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-32 bg-slate-100 rounded-lg mb-3" />
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold">No Products Found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {search ? "Try a different search term" : "No products in this category yet"}
                  </p>
                  <Link href="/quote" className="mt-4 inline-block">
                    <Button className="bg-teal hover:bg-teal/90 text-white">
                      Request a Custom Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Card className="h-full border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all group">
                      <CardContent className="p-4">
                        {/* Image / fallback */}
                        {product.imageUrl ? (
                          <div className="relative h-36 rounded-lg overflow-hidden mb-3 bg-slate-50">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        ) : (
                          <div className="h-36 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
                            <span className="text-4xl">{CATEGORY_ICONS[product.category] || "📦"}</span>
                          </div>
                        )}

                        <Badge variant="outline" className="text-[10px] mb-2">
                          {CATEGORY_ICONS[product.category] || "📦"} {product.category.replace(/-/g, " ")}
                        </Badge>

                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                        {product.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
                        )}

                        <div className="mt-3 flex items-end justify-between">
                          <div>
                            <p className="text-lg font-bold text-teal">${product.unitPrice.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground">per {product.unit}</p>
                          </div>
                          {product.lengthCm && product.widthCm && product.heightCm && (
                            <p className="text-[10px] text-muted-foreground">
                              {product.lengthCm}×{product.widthCm}×{product.heightCm}cm
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <Link href="/quote" className="flex-1">
                            <Button size="sm" className="w-full bg-teal hover:bg-teal/90 text-white text-xs">
                              <ShoppingCart className="h-3 w-3 mr-1" /> Add to Quote
                            </Button>
                          </Link>
                          {product.linkUrl && (
                            <a href={product.linkUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" variant="outline" className="text-xs px-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* ══════════ BOTTOM CTAs ══════════ */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-navy to-navy-light text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <Sparkles className="h-8 w-8 text-teal mb-3" />
              <h3 className="text-xl font-bold">Can&apos;t Find What You Need?</h3>
              <p className="text-sm text-slate-300 mt-2">
                We source from 50,000+ Chinese manufacturers. Tell us what you&apos;re looking for and our AI + sourcing team
                will find it at factory-direct pricing.
              </p>
              <Link href="/quote">
                <Button className="mt-4 bg-teal hover:bg-teal/90 text-white">
                  Request Custom Sourcing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-teal/20 shadow-xl">
            <CardContent className="p-6">
              <Wrench className="h-8 w-8 text-teal mb-3" />
              <h3 className="text-xl font-bold">Consulting & Custom Manufacturing</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Need a custom product designed and manufactured? Our team works with Chinese factories to bring
                your vision to life — from prototype to production.
              </p>
              <Link href="/contact">
                <Button variant="outline" className="mt-4 border-teal text-teal hover:bg-teal/5">
                  Book a Consultation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
