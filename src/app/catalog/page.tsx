"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Package, ExternalLink, ArrowRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

const CATEGORY_ICONS: Record<string, string> = {
  furniture: "🪑",
  electronics: "📱",
  "home-goods": "🏠",
  textiles: "🧵",
  industrial: "⚙️",
  lighting: "💡",
  bathroom: "🚿",
  kitchen: "🍳",
  outdoor: "🌿",
  default: "📦",
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.category))].sort();

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-4 bg-teal/20 text-teal-200 border-teal/30">Product Catalog</Badge>
            <h1 className="text-4xl font-bold mb-4">Browse Our Products</h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Explore our curated selection of premium products sourced directly from China&apos;s best manufacturers.
              Add items to your quote for instant pricing.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-teal hover:bg-teal/90" : ""}
            >
              <Filter className="h-3 w-3 mr-1" /> All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-teal hover:bg-teal/90" : ""}
              >
                {CATEGORY_ICONS[cat] || CATEGORY_ICONS.default} {cat.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {products.length === 0
                ? "Our catalog is being updated. Please check back soon or request a quote for specific items."
                : "Try adjusting your search or filter criteria."}
            </p>
            <Link href="/quote">
              <Button className="mt-6 bg-teal hover:bg-teal/90">
                Request Custom Quote <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-6xl">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      CATEGORY_ICONS[product.category] || CATEGORY_ICONS.default
                    )}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-teal transition-colors">
                        {product.name}
                      </h3>
                      <Badge variant="secondary" className="text-xs shrink-0 capitalize">
                        {product.category.replace("-", " ")}
                      </Badge>
                    </div>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="mt-auto space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-teal">${product.unitPrice.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">/ {product.unit}</span>
                      </div>
                      {(product.lengthCm || product.weightKg) && (
                        <p className="text-xs text-muted-foreground">
                          {product.lengthCm && product.widthCm && product.heightCm
                            ? `${product.lengthCm}×${product.widthCm}×${product.heightCm}cm`
                            : ""}
                          {product.lengthCm && product.weightKg ? " · " : ""}
                          {product.weightKg ? `${product.weightKg}kg` : ""}
                        </p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Link href="/quote" className="flex-1">
                          <Button size="sm" className="w-full bg-teal hover:bg-teal/90 text-xs">
                            Add to Quote
                          </Button>
                        </Link>
                        {product.linkUrl && (
                          <a href={product.linkUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-r from-teal/5 to-gold/5 border">
          <h2 className="text-2xl font-bold mb-3">Don&apos;t See What You Need?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            We source any product from China&apos;s vast manufacturing network.
            Tell us what you need and get a custom quote within 24 hours.
          </p>
          <Link href="/quote">
            <Button size="lg" className="bg-teal hover:bg-teal/90">
              Request Custom Quote <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
