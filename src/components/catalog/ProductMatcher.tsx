"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Upload, Link2, DollarSign, ArrowRight, Loader2, CheckCircle2,
  ImageIcon, X, Sparkles, Tag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NextLink from "next/link";

type InputMode = "url" | "image";

interface MatchResult {
  id: string;
  estimatedPrice: number | null;
  sourcePrice: number | null;
  message: string;
}

interface QuoteResult {
  quoteNumber: string;
}

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

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResult | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

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
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleSubmit = async () => {
    if (!url && !imageData && !description) return;
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

  return (
    <Card className="border-teal/20 bg-gradient-to-br from-white to-teal/5 shadow-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-navy to-navy-light p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal/20">
              <Sparkles className="h-5 w-5 text-teal" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Product Matcher</h3>
              <p className="text-xs text-slate-300">Find it cheaper from China — paste a link or upload a photo</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === "url" ? "default" : "outline"}
              className={mode === "url" ? "bg-teal hover:bg-teal/90" : ""}
              onClick={() => setMode("url")}
            >
              <Link2 className="h-4 w-4 mr-1.5" /> Paste a Link
            </Button>
            <Button
              size="sm"
              variant={mode === "image" ? "default" : "outline"}
              className={mode === "image" ? "bg-teal hover:bg-teal/90" : ""}
              onClick={() => setMode("image")}
            >
              <Upload className="h-4 w-4 mr-1.5" /> Upload Photo
            </Button>
          </div>

          {/* URL mode */}
          {mode === "url" && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Product URL (Amazon, Wayfair, Pottery Barn, RH, etc.)</Label>
                <Input
                  placeholder="https://www.amazon.com/dp/B0..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {/* Image mode */}
          {mode === "image" && (
            <div>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border">
                  <img src={imagePreview} alt="Product" className="w-full max-h-48 object-contain bg-slate-50" />
                  <button
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
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
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    dragOver ? "border-teal bg-teal/5" : "border-slate-200 hover:border-teal/50"
                  }`}
                >
                  <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium">Drop an image here or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 2MB</p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageSelect(file);
                }}
              />
            </div>
          )}

          {/* Price + Description (always visible) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">US Retail Price (optional)</Label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="299.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Describe what you&apos;re looking for</Label>
              <Input
                placeholder="e.g. White marble dining table"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading || (!url && !imageData && !description)}
            className="w-full bg-teal hover:bg-teal/90 text-white h-11"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing...</>
            ) : (
              <><Search className="h-4 w-4 mr-2" /> Find Cheaper from China</>
            )}
          </Button>

          {/* Result */}
          <AnimatePresence>
            {result && !quoteResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl border border-green-200 bg-green-50 p-5"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Match Found!</p>
                    {result.estimatedPrice && result.sourcePrice ? (
                      <div className="mt-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">US Retail</p>
                            <p className="text-lg font-bold text-slate-400 line-through">${result.sourcePrice.toLocaleString()}</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-xs text-green-700 font-medium">China Direct</p>
                            <p className="text-2xl font-bold text-green-700">${result.estimatedPrice.toLocaleString()}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-sm ml-auto">
                            Save {Math.round((1 - result.estimatedPrice / result.sourcePrice) * 100)}%
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-green-800">{result.message}</p>
                    )}
                    <p className="mt-3 text-xs text-green-700">{result.message}</p>

                    {/* Inline quote form */}
                    {!showQuoteForm ? (
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="bg-teal hover:bg-teal/90 text-white" onClick={() => setShowQuoteForm(true)}>
                          Get Exact Quote <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                        <NextLink href="/contact">
                          <Button size="sm" variant="outline">Talk to a Specialist</Button>
                        </NextLink>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-3 border-t border-green-200 pt-4">
                        <p className="text-sm font-medium text-green-900">Enter your details and we&apos;ll send you an exact quote:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-green-800">Name *</Label>
                            <Input placeholder="Your name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1 bg-white" />
                          </div>
                          <div>
                            <Label className="text-xs text-green-800">Email *</Label>
                            <Input type="email" placeholder="you@email.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="mt-1 bg-white" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-green-800">Phone (optional)</Label>
                          <Input placeholder="+1 (425) 000-0000" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="mt-1 bg-white" />
                        </div>
                        <Button
                          className="w-full bg-teal hover:bg-teal/90 text-white"
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
                              if (data.quoteNumber) {
                                setQuoteResult({ quoteNumber: data.quoteNumber });
                              }
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
                className="rounded-xl border border-teal/30 bg-teal/5 p-6 text-center"
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal/10">
                  <CheckCircle2 className="h-8 w-8 text-teal" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Quote Request Submitted!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Quote <strong className="text-teal">{quoteResult.quoteNumber}</strong> has been created.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  We&apos;ve sent a confirmation to <strong>{customerEmail}</strong>. Our sourcing team will review
                  your product and respond within 24 hours with an exact China-direct price.
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => {
                    setResult(null); setQuoteResult(null); setShowQuoteForm(false);
                    setUrl(""); setPrice(""); setDescription(""); setCustomerName(""); setCustomerEmail(""); setCustomerPhone("");
                    clearImage();
                  }}>
                    Search Another Product
                  </Button>
                  <NextLink href="/contact">
                    <Button size="sm" className="bg-teal hover:bg-teal/90 text-white">Contact Us</Button>
                  </NextLink>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              <span>Works with Amazon, Wayfair, West Elm, Pottery Barn, RH, CB2, IKEA, and any product URL or photo</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
