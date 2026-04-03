"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Link2, DollarSign, Loader2, CheckCircle2,
  X, Sparkles, Camera, Globe, ShoppingBag, Star,
  TrendingDown, Package, ArrowRight, RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type InputMode = "url" | "image" | "describe";

interface PricingAnalysis {
  chinaDirectPrice: number;
  estimatedShipping: number;
  dogePrice: number;
  savingsPercent: number | null;
}

interface ProductResult {
  product: {
    id: string;
    name: string;
    priceUSD: number;
    priceCNY: number;
    imageUrl: string;
    salesVolume: number;
    detailUrl: string;
    supplierRating: number | null;
    minOrder: number;
    variants?: { name: string; priceUSD: number; available: number }[];
    images?: string[];
  };
  relevanceScore: number;
  matchConfidence?: string;
  matchReason: string;
  pricingAnalysis: PricingAnalysis;
}

interface SearchResponse {
  id: string;
  results: ProductResult[];
  query: string;
  sourceProduct?: {
    title?: string;
    imageUrl?: string;
    retailPrice?: number;
  };
  profile?: {
    title?: string;
    searchQuery?: string;
    searchQueryChinese?: string;
    category?: string;
    materials?: string[];
    features?: string[];
  };
  inputType?: string;
}

const EXAMPLE_SEARCHES = [
  "Marble dining table, seats 6",
  "Ergonomic office chair, mesh back",
  "LED pendant light, modern brass",
  "Velvet sofa, emerald green, 3-seat",
  "Stainless steel water bottle, 32oz",
  "Bamboo cutting board set",
];

export default function ProductMatcherV2() {
  const [mode, setMode] = useState<InputMode>("describe");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  // Quote modal state
  const [quoteProduct, setQuoteProduct] = useState<ProductResult | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<{ quoteNumber: string } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Prefill from logged-in user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        if (data.user) {
          if (data.user.name) setCustomerName(data.user.name);
          if (data.user.email) setCustomerEmail(data.user.email);
          if (data.user.phone) setCustomerPhone(data.user.phone);
        }
      })
      .catch(() => {});
  }, []);

  // Rotate example text
  useEffect(() => {
    const t = setInterval(() => setExampleIdx((i) => (i + 1) % EXAMPLE_SEARCHES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const handleImageSelect = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setImageData(base64);
      setMode("image");
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageSelect(file);
  }, [handleImageSelect]);

  // Only check the active mode for submit readiness
  const canSubmit = mode === "url" ? url.trim() : mode === "image" ? !!imageData : description.trim();

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setSearchResponse(null);
    setSearchError(null);
    setQuoteProduct(null);
    setQuoteResult(null);

    // Only send input for the CURRENT mode — don't leak leftover data
    const payload: Record<string, unknown> = { sourcePrice: price ? parseFloat(price) : null };
    if (mode === "url") {
      payload.sourceUrl = url.trim() || null;
    } else if (mode === "image") {
      payload.imageData = imageData || null;
    } else {
      payload.description = description.trim() || null;
    }

    try {
      const res = await fetch("/api/tools/product-matcher/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setSearchResponse(data);
      } else {
        setSearchError(data.error || "Search failed. Please try again.");
      }
    } catch {
      setSearchError("Network error. Please check your connection and try again.");
    }
    setLoading(false);
  };

  const handleQuote = async () => {
    if (!quoteProduct || !customerName.trim() || !customerEmail.trim()) return;

    setQuoteLoading(true);
    try {
      const res = await fetch("/api/tools/product-matcher/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchId: searchResponse?.id,
          productName: quoteProduct.product.name,
          productUrl: quoteProduct.product.detailUrl,
          productPrice: quoteProduct.product.priceUSD,
          dogePrice: quoteProduct.pricingAnalysis.dogePrice,
          customerName,
          customerEmail,
          customerPhone: customerPhone || null,
          // Original search context for admin reference
          originalSearchUrl: url || null,
          originalSearchKeywords: description || null,
          originalSearchType: imageData ? "image" : url ? "url" : "description",
          sourceRetailPrice: searchResponse?.sourceProduct?.retailPrice || (price ? parseFloat(price) : null),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuoteResult(data);
        setQuoteProduct(null);
      }
    } catch { /* empty */ }
    setQuoteLoading(false);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageData(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const resetAll = () => {
    setSearchResponse(null);
    setSearchError(null);
    setQuoteResult(null);
    setQuoteProduct(null);
    setUrl("");
    setPrice("");
    setDescription("");
    clearImage();
  };

  const sourcePrice = searchResponse?.sourceProduct?.retailPrice
    || (price ? parseFloat(price) : null);

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card className="border-teal/20 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-navy-light p-5 sm:p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/20 shrink-0">
                <Sparkles className="h-6 w-6 text-teal" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold">AI Product Matcher</h3>
                <p className="text-xs sm:text-sm text-slate-300 truncate">
                  AI-powered sourcing — find factory-direct prices from China
                </p>
              </div>
            </div>
            {/* Scrolling examples */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 overflow-hidden">
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="shrink-0">Try:</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={exampleIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="text-teal-light font-medium truncate cursor-pointer"
                  onClick={() => { setDescription(EXAMPLE_SEARCHES[exampleIdx]); setMode("describe"); }}
                >
                  &ldquo;{EXAMPLE_SEARCHES[exampleIdx]}&rdquo;
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Mode tabs */}
            <div role="tablist" aria-label="Search input method" className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-1">
              {([
                { id: "describe" as const, icon: Search, label: "Describe" },
                { id: "url" as const, icon: Link2, label: "Paste Link" },
                { id: "image" as const, icon: Camera, label: "Photo" },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={mode === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  onClick={() => setMode(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    mode === tab.id
                      ? "bg-white text-teal shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Error display */}
            {searchError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {searchError}
              </div>
            )}

            {/* Input modes */}
            <AnimatePresence mode="wait">
              {mode === "describe" && (
                <motion.div key="describe" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  <Label className="text-xs text-muted-foreground">Describe the product you want</Label>
                  <Input
                    placeholder={EXAMPLE_SEARCHES[exampleIdx]}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                    className="mt-1 h-11"
                    autoFocus
                  />
                </motion.div>
              )}

              {mode === "url" && (
                <motion.div key="url" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Product URL</Label>
                    <Input
                      placeholder="https://www.amazon.com/dp/B0... or any product link"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                      className="mt-1 h-11"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1 flex-wrap">
                      <Globe className="h-3 w-3 shrink-0" />
                      Amazon, Wayfair, Target, Walmart, IKEA, Shopify, or any store
                    </p>
                  </div>
                </motion.div>
              )}

              {mode === "image" && (
                <motion.div key="image" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border bg-slate-50">
                      <img src={imagePreview} alt="Product" className="w-full max-h-52 object-contain" />
                      <button
                        onClick={clearImage}
                        aria-label="Remove image"
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 active:scale-95 transition-transform"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileRef.current?.click()}
                      role="button"
                      aria-label="Upload product image"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
                      className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all active:scale-[0.98] ${
                        dragOver ? "border-teal bg-teal/5 scale-[1.01]" : "border-slate-200 hover:border-teal/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                        <Camera className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">Tap to take a photo or browse</p>
                      <p className="text-xs text-muted-foreground mt-1">or drag & drop -- JPG, PNG, WebP -- max 2MB</p>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageSelect(file);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Price field */}
            <div>
              <Label className="text-xs text-muted-foreground">US Retail Price you saw (optional)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="299.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !canSubmit}
              className="w-full bg-teal hover:bg-teal/90 text-white h-12 text-base font-semibold active:scale-[0.98] transition-transform"
            >
              {loading ? (
                <><Loader2 className="h-5 w-5 animate-spin mr-2" /> AI is searching...</>
              ) : (
                <><Search className="h-5 w-5 mr-2" /> Find Products from China</>
              )}
            </Button>

            {/* Loading animation — interactive engagement sequence */}
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Progress bar */}
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal via-teal-light to-teal rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: ["0%", "30%", "55%", "75%", "88%", "92%"] }}
                      transition={{ duration: 15, times: [0, 0.1, 0.25, 0.5, 0.8, 1], ease: "easeOut" }}
                    />
                  </div>

                  {/* Step-by-step status updates */}
                  <div className="space-y-2.5">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="shrink-0">
                        <Sparkles className="h-4 w-4 text-teal" />
                      </motion.div>
                      <span className="text-navy font-medium">Analyzing your product...</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="shrink-0">
                        <Globe className="h-4 w-4 text-teal" />
                      </motion.div>
                      <span className="text-navy font-medium">Connecting to factory networks...</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 4 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity }} className="shrink-0">
                        <Package className="h-4 w-4 text-teal" />
                      </motion.div>
                      <span className="text-navy font-medium">Scanning factory catalogs...</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 7 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <motion.div animate={{ scale: [1, 0.9, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="shrink-0">
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      </motion.div>
                      <span className="text-navy font-medium">Comparing wholesale prices...</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 10 }}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="shrink-0">
                        <Star className="h-4 w-4 text-amber-500" />
                      </motion.div>
                      <span className="text-navy font-medium">Ranking best matches...</span>
                    </motion.div>
                  </div>

                  {/* Animated factory/supplier count */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 3 }}
                    className="rounded-lg bg-gradient-to-r from-slate-50 to-teal/5 border p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <motion.span
                          className="font-mono font-bold text-teal text-sm"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FactoryCounter />
                        </motion.span>
                        <span>factories scanned</span>
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-teal"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Fun fact while waiting */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 6 }}
                    className="text-xs text-muted-foreground italic text-center"
                  >
                    <RotatingFact />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {searchResponse && !quoteResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Results header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy">
                  {searchResponse.results.length > 0
                    ? `${searchResponse.results.length} Product${searchResponse.results.length > 1 ? "s" : ""} Found`
                    : "No Exact Matches"}
                </h3>
                {searchResponse.profile && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Searched: {searchResponse.query}
                    {searchResponse.profile.searchQueryChinese && (
                      <span className="ml-1 text-teal">({searchResponse.profile.searchQueryChinese})</span>
                    )}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={resetAll} className="text-xs">
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> New Search
              </Button>
            </div>

            {/* Source product reference (scraped from user's link) */}
            {searchResponse.sourceProduct && (
              <Card className="border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-start gap-3">
                  {searchResponse.sourceProduct.imageUrl && (
                    <img
                      src={searchResponse.sourceProduct.imageUrl}
                      alt="Source product"
                      className="w-16 h-16 object-contain rounded border bg-white shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Your product</p>
                    <p className="text-sm font-semibold text-navy line-clamp-2">
                      {searchResponse.sourceProduct.title}
                    </p>
                    {searchResponse.sourceProduct.retailPrice && (
                      <p className="text-sm font-bold text-slate-600 mt-1">
                        US Retail: ${searchResponse.sourceProduct.retailPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Product cards grid */}
            {searchResponse.results.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {searchResponse.results.map((result) => (
                  <ProductCard
                    key={result.product.id}
                    result={result}
                    sourcePrice={sourcePrice}
                    onQuote={() => setQuoteProduct(result)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6 sm:p-8 text-center space-y-4">
                <Package className="h-12 w-12 mx-auto text-slate-300" />
                <div>
                  <p className="text-base font-semibold text-navy">We couldn&apos;t find an automatic match</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Our sourcing team can manually find this product for you from our factory network — leave your info and we&apos;ll get back within 24 hours with options and pricing.
                  </p>
                </div>
                <Button
                  onClick={() => setQuoteProduct({
                    product: { id: "manual", name: searchResponse.query || "Custom sourcing request", priceUSD: 0, priceCNY: 0, imageUrl: "", salesVolume: 0, detailUrl: "", supplierRating: null, minOrder: 1 },
                    relevanceScore: 0,
                    matchConfidence: "Manual",
                    matchReason: "Manual sourcing by our team",
                    pricingAnalysis: { chinaDirectPrice: 0, estimatedShipping: 0, dogePrice: 0, savingsPercent: null },
                  })}
                  className="bg-teal hover:bg-teal/90 text-white px-6 h-10"
                >
                  <ArrowRight className="h-4 w-4 mr-2" /> Request Manual Sourcing
                </Button>
                <p className="text-xs text-muted-foreground">Free — no commitment required</p>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quote confirmation */}
      <AnimatePresence>
        {quoteResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-green-200 bg-green-50 p-5 sm:p-6"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Quote Request Submitted!</p>
                <p className="text-sm text-green-800 mt-1">
                  Quote <span className="font-mono font-bold">{quoteResult.quoteNumber}</span> created.
                  We&apos;ll email you with the exact China-direct price within 24 hours.
                </p>
                <Button variant="outline" size="sm" onClick={resetAll} className="mt-3 text-xs">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Search Another Product
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Quote Modal Dialog ─── */}
      <Dialog open={!!quoteProduct} onOpenChange={(open) => { if (!open) setQuoteProduct(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Get a Quote</DialogTitle>
            <DialogDescription>
              We&apos;ll source this product from China and send you an exact price within 24 hours.
            </DialogDescription>
          </DialogHeader>

          {quoteProduct && (
            <div className="space-y-5">
              {/* Selected product summary */}
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                {quoteProduct.product.imageUrl && (
                  <img
                    src={quoteProduct.product.imageUrl}
                    alt={quoteProduct.product.name}
                    className="w-16 h-16 object-contain rounded bg-white border shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy line-clamp-2">{quoteProduct.product.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-lg font-bold text-green-600">
                      ${quoteProduct.pricingAnalysis.dogePrice.toFixed(2)}
                    </span>
                    {sourcePrice && quoteProduct.pricingAnalysis.savingsPercent && quoteProduct.pricingAnalysis.savingsPercent > 0 && (
                      <span className="text-xs text-green-600 font-semibold">
                        Save {quoteProduct.pricingAnalysis.savingsPercent}% vs US retail
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact form */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="quote-name">Name *</Label>
                  <Input
                    id="quote-name"
                    placeholder="Your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-email">Email *</Label>
                  <Input
                    id="quote-email"
                    placeholder="you@company.com"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="quote-phone">Phone (optional)</Label>
                  <Input
                    id="quote-phone"
                    placeholder="+1 (555) 000-0000"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleQuote}
                disabled={quoteLoading || !customerName.trim() || !customerEmail.trim()}
                className="w-full h-11 bg-teal hover:bg-teal/90 text-base font-semibold"
              >
                {quoteLoading ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Submitting...</>
                ) : (
                  <><ArrowRight className="h-5 w-5 mr-2" /> Request Quote</>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                No commitment required. We&apos;ll respond within 24 hours.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Product Card Component (simplified — quote form is now a modal) ───

function ProductCard({
  result,
  sourcePrice,
  onQuote,
}: {
  result: ProductResult;
  sourcePrice: number | null;
  onQuote: () => void;
}) {
  const { product, matchReason, matchConfidence, pricingAnalysis } = result;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Product image */}
        <div className="w-28 sm:w-32 shrink-0 bg-slate-50 flex items-center justify-center p-2">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-28 sm:h-32 object-contain rounded"
              loading="lazy"
            />
          ) : (
            <Package className="h-10 w-10 text-slate-300" />
          )}
        </div>

        {/* Product info */}
        <div className="flex-1 p-3 sm:p-4 min-w-0">
          <h4 className="text-sm font-semibold text-navy line-clamp-2 leading-snug">{product.name}</h4>

          {/* Pricing */}
          <div className="mt-2 flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-green-600">
              ${pricingAnalysis.dogePrice.toFixed(2)}
            </span>
            {sourcePrice && pricingAnalysis.savingsPercent && pricingAnalysis.savingsPercent > 0 && (
              <>
                <span className="text-sm text-slate-400 line-through">${sourcePrice.toFixed(2)}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                  Save {pricingAnalysis.savingsPercent}%
                </Badge>
              </>
            )}
          </div>

          {/* Meta badges */}
          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Package className="h-3 w-3" />
              Factory: ${product.priceUSD.toFixed(2)}
            </span>
            {product.salesVolume > 0 && (
              <span className="flex items-center gap-0.5">
                <TrendingDown className="h-3 w-3" />
                {product.salesVolume.toLocaleString()} sold
              </span>
            )}
            {product.supplierRating && (
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3 text-amber-500" />
                {product.supplierRating}
              </span>
            )}
          </div>

          {/* Match reason + confidence */}
          <div className="mt-1.5 flex items-center gap-1.5">
            {matchConfidence && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                matchConfidence === "High" ? "bg-green-100 text-green-700" :
                matchConfidence === "Medium" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-500"
              }`}>{matchConfidence}</span>
            )}
            <p className="text-xs text-teal">{matchReason}</p>
          </div>

          {/* Action */}
          <div className="mt-3">
            <Button
              size="sm"
              onClick={onQuote}
              className="h-8 text-xs bg-teal hover:bg-teal/90 px-4"
            >
              Get Quote
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Loading Animation Helpers ───

/** Animated counter that ticks up to simulate factory scanning */
function FactoryCounter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => {
        if (c >= 12400) return c;
        const increment = c < 1000 ? 47 : c < 5000 ? 83 : c < 10000 ? 31 : 7;
        return Math.min(c + increment, 12400);
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return <>{count.toLocaleString()}</>;
}

const SOURCING_FACTS = [
  "💡 China produces 28% of all manufactured goods worldwide",
  "📦 The average factory-direct price is 60-80% less than US retail",
  "🏭 Guangdong province alone has over 300,000 factories",
  "🚢 A standard 40ft container holds ~2,400 sofa cushions",
  "💰 Removing middlemen typically saves 3-5x on unit costs",
  "🌏 Over 50% of global furniture is manufactured in China",
  "⚡ Our AI matches products across multiple factory networks",
  "📊 We compare prices from verified suppliers with quality ratings",
];

/** Rotates through fun sourcing facts while user waits */
function RotatingFact() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SOURCING_FACTS.length), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={idx}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.3 }}
      >
        {SOURCING_FACTS[idx]}
      </motion.span>
    </AnimatePresence>
  );
}
