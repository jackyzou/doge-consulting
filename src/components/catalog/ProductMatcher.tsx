"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Link2, DollarSign, ArrowRight, Loader2, CheckCircle2,
  ImageIcon, X, Sparkles, Tag, Camera, Globe, ShoppingBag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NextLink from "next/link";

type InputMode = "url" | "image" | "describe";

interface MatchResult {
  id: string;
  estimatedPrice: number | null;
  sourcePrice: number | null;
  message: string;
}

interface QuoteResult {
  quoteNumber: string;
}

const EXAMPLE_SEARCHES = [
  "Marble dining table, seats 6",
  "Ergonomic office chair, mesh back",
  "LED pendant light, modern brass",
  "Velvet sofa, emerald green, 3-seat",
];

export default function ProductMatcher() {
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Prefill from logged-in user
  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
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

  const canSubmit = url.trim() || imageData || description.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/catalog/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: url || null,
          imageData: imageData || null,
          description: description || null,
          sourcePrice: price ? parseFloat(price) : null,
        }),
      });
      const data = await res.json();
      if (res.ok) setResult(data);
    } catch { /* empty */ }
    setLoading(false);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageData(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const resetAll = () => {
    setResult(null); setQuoteResult(null); setShowQuoteForm(false);
    setUrl(""); setPrice(""); setDescription("");
    clearImage();
  };

  return (
    <Card className="border-teal/20 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy to-navy-light p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/20 shrink-0">
              <Sparkles className="h-6 w-6 text-teal" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold">Find It Cheaper from China</h3>
              <p className="text-xs sm:text-sm text-slate-300 truncate">Paste a link, upload a photo, or describe what you need</p>
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
          {/* Mode tabs — full width on mobile */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 rounded-lg p-1">
            {([
              { id: "url" as const, icon: Link2, label: "Paste Link" },
              { id: "image" as const, icon: Camera, label: "Photo" },
              { id: "describe" as const, icon: Search, label: "Describe" },
            ]).map((tab) => (
              <button
                key={tab.id}
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

          {/* URL mode */}
          <AnimatePresence mode="wait">
            {mode === "url" && (
              <motion.div key="url" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Product URL</Label>
                  <Input
                    placeholder="https://www.amazon.com/dp/B0..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                    className="mt-1 h-11"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1 flex-wrap">
                    <Globe className="h-3 w-3 shrink-0" />
                    Amazon, Wayfair, West Elm, Pottery Barn, RH, CB2, IKEA, or any store
                  </p>
                </div>
              </motion.div>
            )}

            {/* Image mode */}
            {mode === "image" && (
              <motion.div key="image" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden border bg-slate-50">
                    <img src={imagePreview} alt="Product" className="w-full max-h-52 object-contain" />
                    <button
                      onClick={clearImage}
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
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all active:scale-[0.98] ${
                      dragOver ? "border-teal bg-teal/5 scale-[1.01]" : "border-slate-200 hover:border-teal/50 hover:bg-slate-50"
                    }`}
                  >
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Camera className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium">Tap to take a photo or browse</p>
                    <p className="text-xs text-muted-foreground mt-1">or drag & drop • JPG, PNG, WebP • max 2MB</p>
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

            {/* Describe mode */}
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
          </AnimatePresence>

          {/* Price — always visible, single row */}
          <div>
            <Label className="text-xs text-muted-foreground">US Retail Price you saw (optional — helps us estimate savings)</Label>
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
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Finding matches...</>
            ) : (
              <><Search className="h-5 w-5 mr-2" /> Find Cheaper from China</>
            )}
          </Button>

          {/* Loading animation */}
          <AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-teal to-teal-light rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "90%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-teal animate-pulse" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    Searching 50,000+ Chinese manufacturers...
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result */}
          <AnimatePresence>
            {result && !quoteResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-green-900">Match Found!</p>
                    {result.estimatedPrice && result.sourcePrice ? (
                      <div className="mt-3">
                        {/* Price comparison — stacks on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4">
                            <div>
                              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">US Retail</p>
                              <p className="text-lg font-bold text-slate-400 line-through">${result.sourcePrice.toLocaleString()}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-green-500 shrink-0" />
                            <div>
                              <p className="text-[10px] sm:text-xs text-green-700 font-medium uppercase tracking-wider">China Direct</p>
                              <p className="text-2xl sm:text-3xl font-bold text-green-700">${result.estimatedPrice.toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-sm w-fit shrink-0">
                            Save {Math.round((1 - result.estimatedPrice / result.sourcePrice) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-green-800">{result.message}</p>
                    )}
                    <p className="mt-3 text-xs text-green-700 leading-relaxed">{result.message}</p>

                    {/* Inline quote form */}
                    {!showQuoteForm ? (
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <Button size="sm" className="bg-teal hover:bg-teal/90 text-white flex-1 sm:flex-none" onClick={() => setShowQuoteForm(true)}>
                          Get Exact Quote <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                        <NextLink href="/contact" className="flex-1 sm:flex-none">
                          <Button size="sm" variant="outline" className="w-full">Talk to a Specialist</Button>
                        </NextLink>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 border-t border-green-200 pt-4">
                        <p className="text-sm font-medium text-green-900">Enter your details for an exact quote:</p>
                        {/* Stacks on mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-green-800">Name *</Label>
                            <Input placeholder="Your name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 bg-white h-10" />
                          </div>
                          <div>
                            <Label className="text-xs text-green-800">Email *</Label>
                            <Input type="email" placeholder="you@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1 bg-white h-10" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-green-800">Phone (optional)</Label>
                          <Input type="tel" inputMode="tel" placeholder="+1 (425) 000-0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 bg-white h-10" />
                        </div>
                        <Button
                          className="w-full bg-teal hover:bg-teal/90 text-white h-11 active:scale-[0.98] transition-transform"
                          disabled={quoteLoading || !customerName.trim() || !customerEmail.trim()}
                          onClick={async () => {
                            setQuoteLoading(true);
                            try {
                              const res = await fetch("/api/catalog/match", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  matchId: result.id,
                                  sourceUrl: url || null,
                                  imageData: imageData || null,
                                  description: description || null,
                                  sourcePrice: price ? parseFloat(price) : null,
                                  customerName: customerName.trim(),
                                  customerEmail: customerEmail.trim(),
                                  customerPhone: customerPhone.trim() || null,
                                  createQuote: true,
                                }),
                              });
                              const data = await res.json();
                              if (data.quoteNumber) setQuoteResult({ quoteNumber: data.quoteNumber });
                            } catch { /* empty */ }
                            setQuoteLoading(false);
                          }}
                        >
                          {quoteLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : <>Submit Quote Request <ArrowRight className="h-4 w-4 ml-2" /></>}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quote confirmation */}
            {quoteResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-teal/30 bg-teal/5 p-5 sm:p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10"
                >
                  <CheckCircle2 className="h-9 w-9 text-teal" />
                </motion.div>
                <h3 className="text-lg font-bold text-foreground">Quote Request Submitted!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Quote <strong className="text-teal">{quoteResult.quoteNumber}</strong> has been created.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  We&apos;ve sent a confirmation to <strong>{customerEmail}</strong>. Our sourcing team will review
                  your product and respond within 24 hours with an exact China-direct price.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={resetAll} className="w-full sm:w-auto">
                    Search Another Product
                  </Button>
                  <NextLink href="/contact">
                    <Button size="sm" className="bg-teal hover:bg-teal/90 text-white w-full sm:w-auto">Contact Us</Button>
                  </NextLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom hint — hidden when result is shown */}
          {!result && !loading && (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Tag className="h-3 w-3 shrink-0" />
              <span>Works with any product URL, photo, or description. We match against 50,000+ factories.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
