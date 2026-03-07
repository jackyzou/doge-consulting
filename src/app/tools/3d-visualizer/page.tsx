"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Ruler, Ship, ArrowRight, BarChart3, Calculator, Eye, Package, User, ShoppingCart,
  Loader2, Send, CheckCircle, LogIn, Mail, Plus, Trash2, Scale, AlertTriangle, ArrowUpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { toast } from "sonner";
import { toCm, CONTAINERS, volumeUtilization, weightUtilization, round } from "@/lib/unit-conversions";
import type { ThreeSceneHandle, CargoItem } from "@/components/tools/ThreeScene";
import { CARGO_COLORS, packItemsIntoContainer } from "@/components/tools/ThreeScene";

const ThreeScene = dynamic(() => import("@/components/tools/ThreeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-900 rounded-xl min-h-[400px]">
      <div className="text-center space-y-3">
        <Box className="h-10 w-10 text-teal mx-auto animate-pulse" />
        <p className="text-sm text-slate-400">Loading 3D scene...</p>
      </div>
    </div>
  ),
});

const OBJECT_PRESETS = [
  { id: "carton-small", name: "Small Carton", icon: "📦", l: 40, w: 30, h: 30, wt: 8 },
  { id: "carton-medium", name: "Medium Carton", icon: "📦", l: 60, w: 40, h: 40, wt: 15 },
  { id: "carton-large", name: "Large Carton", icon: "📦", l: 80, w: 60, h: 60, wt: 25 },
  { id: "pallet-loaded", name: "Loaded Pallet", icon: "🏗️", l: 120, w: 80, h: 150, wt: 500 },
  { id: "sofa", name: "Sofa (3-seater)", icon: "🛋️", l: 220, w: 90, h: 85, wt: 60 },
  { id: "dining-table", name: "Dining Table", icon: "🪑", l: 180, w: 90, h: 76, wt: 45 },
  { id: "wardrobe", name: "Wardrobe", icon: "🗄️", l: 200, w: 60, h: 220, wt: 90 },
  { id: "king-bed", name: "King Bed Frame", icon: "🛏️", l: 210, w: 195, h: 40, wt: 80 },
  { id: "office-desk", name: "Office Desk", icon: "💼", l: 140, w: 70, h: 75, wt: 40 },
  { id: "tv-console", name: "TV Console", icon: "📺", l: 160, w: 45, h: 55, wt: 35 },
  { id: "washing-machine", name: "Washing Machine", icon: "🫧", l: 60, w: 60, h: 85, wt: 65 },
  { id: "refrigerator", name: "Refrigerator", icon: "🧊", l: 70, w: 70, h: 180, wt: 80 },
];

interface CatalogProduct { id: string; name: string; category: string; unitPrice: number; lengthCm: number | null; widthCm: number | null; heightCm: number | null; weightKg: number | null; }

const FREE_ITEM_LIMIT = 6;
let nextItemId = 1;

export default function ThreeDVisualizerPage() {
  // ── Items list ──────────────────────────────────────────────
  const [items, setItems] = useState<CargoItem[]>([]);
  const [containerType, setContainerType] = useState("20gp");
  const [showContainer, setShowContainer] = useState(true);
  const [showHuman, setShowHuman] = useState(true);
  const [packedMode, setPackedMode] = useState(false);

  // ── Auth ────────────────────────────────────────────────────
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ── Quote ───────────────────────────────────────────────────
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [quoteStep, setQuoteStep] = useState<"confirm" | "success">("confirm");
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [submittedQuoteNumber, setSubmittedQuoteNumber] = useState("");

  // ── Catalog ─────────────────────────────────────────────────
  const [catalogProducts, setCatalogProducts] = useState<CatalogProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // ── Packing result ──────────────────────────────────────────
  const [packResult, setPackResult] = useState<{ fits: boolean; suggestedContainer: string | null } | null>(null);

  const sceneRef = useRef<ThreeSceneHandle>(null);
  const container = CONTAINERS.find((c) => c.type === containerType) || CONTAINERS[0];

  useEffect(() => {
    setCatalogLoading(true);
    fetch("/api/catalog").then(r => r.json()).then(d => { if (Array.isArray(d)) setCatalogProducts(d.filter((p: CatalogProduct) => p.lengthCm && p.widthCm && p.heightCm)); }).catch(() => {}).finally(() => setCatalogLoading(false));
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(d => { if (d?.user) { setUser(d.user); setAuthName(d.user.name || ""); setAuthEmail(d.user.email || ""); } }).catch(() => {});
  }, []);

  // ── Computed ────────────────────────────────────────────────
  const totalCbm = useMemo(() => items.reduce((s, i) => s + i.lm * i.wm * i.hm, 0), [items]);
  const totalWeight = useMemo(() => items.reduce((s, i) => s + i.weightKg, 0), [items]);
  const volPct = volumeUtilization(totalCbm, container.cbm);
  const wtPct = weightUtilization(totalWeight, container.maxKg);

  // ── Layout items side-by-side when NOT packed ───────────────
  const displayItems = useMemo(() => {
    if (packedMode && packResult) {
      // Use packed positions
      return items;
    }
    // Lay items out in a row on the ground
    let cx = 0;
    return items.map((item) => {
      const positioned = { ...item, px: cx, py: 0, pz: 0, packed: false };
      cx += item.lm + 0.08;
      return positioned;
    });
  }, [items, packedMode, packResult]);

  // ── Add item (with login gate at 7+) ────────────────────────
  const addItemFromPreset = (preset: typeof OBJECT_PRESETS[0]) => {
    if (items.length >= FREE_ITEM_LIMIT && !user) {
      setShowAuthDialog(true);
      toast.info("Sign up to add more than 6 items");
      return;
    }
    const id = `item-${nextItemId++}`;
    const lm = preset.l / 100;
    const wm = preset.w / 100;
    const hm = preset.h / 100;
    setItems(prev => [...prev, { id, name: `${preset.icon} ${preset.name}`, lm, wm, hm, weightKg: preset.wt, color: CARGO_COLORS[prev.length % CARGO_COLORS.length], px: 0, py: 0, pz: 0, packed: false }]);
    setPackedMode(false);
    setPackResult(null);
  };

  const addItemFromCatalog = (product: CatalogProduct) => {
    if (items.length >= FREE_ITEM_LIMIT && !user) {
      setShowAuthDialog(true);
      toast.info("Sign up to add more than 6 items");
      return;
    }
    const id = `cat-${nextItemId++}`;
    const lm = (product.lengthCm || 0) / 100;
    const wm = (product.widthCm || 0) / 100;
    const hm = (product.heightCm || 0) / 100;
    setItems(prev => [...prev, { id, name: product.name, lm, wm, hm, weightKg: product.weightKg || 0, color: CARGO_COLORS[prev.length % CARGO_COLORS.length], px: 0, py: 0, pz: 0, packed: false }]);
    setPackedMode(false);
    setPackResult(null);
  };

  const addCustomItem = (l: number, w: number, h: number, wt: number, name: string) => {
    if (items.length >= FREE_ITEM_LIMIT && !user) {
      setShowAuthDialog(true);
      toast.info("Sign up to add more than 6 items");
      return;
    }
    const id = `cust-${nextItemId++}`;
    setItems(prev => [...prev, { id, name: name || `Custom ${round(l, 0)}×${round(w, 0)}×${round(h, 0)}`, lm: l / 100, wm: w / 100, hm: h / 100, weightKg: wt, color: CARGO_COLORS[prev.length % CARGO_COLORS.length], px: 0, py: 0, pz: 0, packed: false }]);
    setPackedMode(false);
    setPackResult(null);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setPackedMode(false);
    setPackResult(null);
  };

  // ── Pack items into container ───────────────────────────────
  const handlePack = () => {
    if (items.length === 0) return;
    const result = packItemsIntoContainer(items, container);
    setItems(result.packed);
    setPackResult({ fits: result.fits, suggestedContainer: result.suggestedContainer });
    setPackedMode(true);
    if (result.fits) {
      toast.success("All items fit in the container!");
    } else if (result.suggestedContainer) {
      toast.warning(`Some items don't fit — try upgrading to ${result.suggestedContainer === "40gp" ? "40ft" : "40ft HC"}`);
    } else {
      toast.error("Items exceed maximum container capacity");
    }
  };

  // ── Auth handler ────────────────────────────────────────────
  const handleAuth = async () => {
    setAuthError("");
    if (!authEmail) { setAuthError("Email is required"); return; }
    setAuthLoading(true);
    try {
      const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = authMode === "signup" ? { email: authEmail, password: authPass, name: authName, phone: authPhone } : { email: authEmail, password: authPass };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); setAuthError(d.error || "Failed"); setAuthLoading(false); return; }
      const d = await res.json();
      setUser(d.user);
      setAuthName(d.user.name || authName);
      setAuthEmail(d.user.email || authEmail);
      window.dispatchEvent(new Event("auth-changed"));
      setShowAuthDialog(false);
      toast.success(`Welcome, ${d.user.name}!`);
    } catch { setAuthError("Network error"); }
    setAuthLoading(false);
  };

  // ── Quote submission ────────────────────────────────────────
  const handleGetQuote = () => {
    if (items.length === 0) { toast.error("Add items first"); return; }
    if (!user) { setShowAuthDialog(true); return; }
    setQuoteStep("confirm");
    setShowQuoteDialog(true);
  };

  const handleSubmitQuote = async () => {
    setQuoteSubmitting(true);
    const snapshot = sceneRef.current?.takeSnapshot() || null;
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: user?.name || authName,
          customerEmail: user?.email || authEmail,
          userId: user?.id,
          deliveryType: "visualizer",
          destination: "Seattle, WA",
          totalCBM: round(totalCbm, 4),
          totalWeight: round(totalWeight, 1),
          shippingEstimateUSD: 0,
          items: items.map(i => ({ name: i.name, quantity: 1, cbm: round(i.lm * i.wm * i.hm, 4), weightKG: i.weightKg })),
          visualizerConfig: { items: items.length, totalCbm: round(totalCbm, 4), totalWeight: round(totalWeight, 1), containerType: container.label, packed: packedMode },
          snapshotDataUrl: snapshot,
          notes: `3D Visualizer: ${items.length} items, ${round(totalCbm, 4)} CBM, ${round(totalWeight, 1)} kg. Container: ${container.label}`,
        }),
      });
      if (!res.ok) { toast.error("Failed to submit"); setQuoteSubmitting(false); return; }
      const d = await res.json();
      setSubmittedQuoteNumber(d.quoteNumber);
      setQuoteStep("success");
    } catch { toast.error("Network error"); }
    setQuoteSubmitting(false);
  };

  // ── Custom item form state ──────────────────────────────────
  const [custL, setCustL] = useState(""); const [custW, setCustW] = useState(""); const [custH, setCustH] = useState(""); const [custWt, setCustWt] = useState(""); const [custName, setCustName] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge className="mb-3 bg-teal/20 text-teal-200 border-teal/30">Interactive 3D Tool</Badge>
            <h1 className="text-3xl font-bold mb-2">3D Container Load Planner</h1>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto">Add items from presets or your product catalog, visualize them in 3D, then pack everything into a container with optimized spacing.</p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* ── LEFT PANEL ──────────────────────────────────── */}
          <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
            {/* Add from presets */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-teal" /> Add Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Label className="text-xs font-medium">Standard Objects</Label>
                <div className="flex flex-wrap gap-1.5">
                  {OBJECT_PRESETS.map(p => (
                    <Button key={p.id} variant="outline" size="sm" onClick={() => addItemFromPreset(p)} className="text-[11px] gap-1 h-7 px-2">
                      {p.icon} {p.name}
                    </Button>
                  ))}
                </div>

                {catalogProducts.length > 0 && (
                  <>
                    <Separator />
                    <Label className="text-xs font-medium flex items-center gap-1"><ShoppingCart className="h-3 w-3" /> Product Catalog</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {catalogProducts.map(p => (
                        <Button key={p.id} variant="outline" size="sm" onClick={() => addItemFromCatalog(p)} className="text-[11px] gap-1 h-7 px-2">
                          📦 {p.name}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
                {catalogLoading && <p className="text-xs text-muted-foreground flex gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Loading catalog...</p>}

                <Separator />
                <Label className="text-xs font-medium">Custom Dimensions (cm)</Label>
                <div className="grid grid-cols-6 gap-1.5">
                  <Input placeholder="Name" value={custName} onChange={e => setCustName(e.target.value)} className="col-span-6 text-xs h-7" />
                  <Input type="number" placeholder="L" value={custL} onChange={e => setCustL(e.target.value)} className="text-xs h-7" />
                  <Input type="number" placeholder="W" value={custW} onChange={e => setCustW(e.target.value)} className="text-xs h-7" />
                  <Input type="number" placeholder="H" value={custH} onChange={e => setCustH(e.target.value)} className="text-xs h-7" />
                  <Input type="number" placeholder="kg" value={custWt} onChange={e => setCustWt(e.target.value)} className="text-xs h-7" />
                  <Button size="sm" className="col-span-2 h-7 text-xs bg-teal hover:bg-teal/90" onClick={() => {
                    const cl = parseFloat(custL) || 0; const cw = parseFloat(custW) || 0; const ch = parseFloat(custH) || 0;
                    if (cl <= 0 || cw <= 0 || ch <= 0) { toast.error("Enter L, W, H"); return; }
                    addCustomItem(cl, cw, ch, parseFloat(custWt) || 0, custName);
                    setCustL(""); setCustW(""); setCustH(""); setCustWt(""); setCustName("");
                  }}>
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </div>
                {items.length >= FREE_ITEM_LIMIT && !user && (
                  <p className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Sign up free to add more than {FREE_ITEM_LIMIT} items</p>
                )}
              </CardContent>
            </Card>

            {/* Item list */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Box className="h-4 w-4 text-teal" /> Items ({items.length})</span>
                  {items.length > 0 && <Button variant="ghost" size="sm" className="text-xs h-6 text-red-500" onClick={() => { setItems([]); setPackedMode(false); setPackResult(null); }}>Clear All</Button>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No items yet. Add from presets above.</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 py-1 border-b last:border-0">
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: `#${item.color.toString(16).padStart(6, "0")}` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{round(item.lm * 100, 0)}×{round(item.wm * 100, 0)}×{round(item.hm * 100, 0)}cm · {item.weightKg}kg · {round(item.lm * item.wm * item.hm, 3)}m³</p>
                        </div>
                        {item.packed === false && packedMode && <Badge variant="destructive" className="text-[9px] shrink-0">No fit</Badge>}
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500" onClick={() => removeItem(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Container + Pack */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm"><Ship className="h-4 w-4 text-teal" /> Container</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={containerType} onValueChange={(v) => { setContainerType(v); setPackedMode(false); setPackResult(null); }}>
                  <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTAINERS.map(c => <SelectItem key={c.type} value={c.type}>{c.label} — {c.cbm}m³, {(c.maxKg / 1000).toFixed(1)}t</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Utilization bars */}
                {items.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-10 text-muted-foreground">Volume</span>
                      <Progress value={Math.min(volPct, 100)} className={`h-2 flex-1 ${volPct > 100 ? "[&>div]:bg-red-500" : "[&>div]:bg-teal"}`} />
                      <span className={`text-[10px] w-12 text-right font-medium ${volPct > 100 ? "text-red-600" : ""}`}>{round(volPct, 1)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] w-10 text-muted-foreground">Weight</span>
                      <Progress value={Math.min(wtPct, 100)} className={`h-2 flex-1 ${wtPct > 100 ? "[&>div]:bg-red-500" : "[&>div]:bg-navy-light"}`} />
                      <span className={`text-[10px] w-12 text-right font-medium ${wtPct > 100 ? "text-red-600" : ""}`}>{round(wtPct, 1)}%</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{round(totalCbm, 3)} / {container.cbm} m³</span>
                      <span><Scale className="h-3 w-3 inline" /> {round(totalWeight, 0)} / {(container.maxKg / 1000).toFixed(1)}t</span>
                    </div>
                  </div>
                )}

                {/* Pack button */}
                <Button onClick={handlePack} disabled={items.length === 0} className="w-full bg-navy hover:bg-navy/90 gap-2 text-sm">
                  <ArrowUpCircle className="h-4 w-4" /> Fit All Items into Container
                </Button>

                {/* Pack result feedback */}
                {packResult && !packResult.fits && packResult.suggestedContainer && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs">
                    <p className="text-amber-800 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Some items don&apos;t fit</p>
                    <p className="text-amber-700 mt-1">Try upgrading to a larger container:</p>
                    <Button size="sm" variant="outline" className="mt-1.5 text-xs h-7 border-amber-300" onClick={() => { setContainerType(packResult.suggestedContainer!); setPackedMode(false); setPackResult(null); }}>
                      Switch to {packResult.suggestedContainer === "40gp" ? "40ft Standard" : "40ft High Cube"}
                    </Button>
                  </div>
                )}
                {packResult && packResult.fits && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 text-xs">
                    <p className="text-green-800 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" /> All items fit!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scene toggles */}
            <Card>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" /> Human Scale</Label>
                  <Switch checked={showHuman} onCheckedChange={setShowHuman} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1"><Ship className="h-3 w-3" /> Show Container</Label>
                  <Switch checked={showContainer} onCheckedChange={setShowContainer} />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button onClick={handleGetQuote} className="w-full bg-teal hover:bg-teal/90 gap-2 text-sm" disabled={items.length === 0}>
                <Send className="h-4 w-4" /> Save &amp; Get Quote
              </Button>
              <Link href="/tools/cbm-calculator"><Button variant="outline" className="w-full gap-2 text-sm"><Calculator className="h-4 w-4" /> CBM Calculator</Button></Link>
              <Link href="/tools/revenue-calculator"><Button variant="outline" className="w-full gap-2 text-sm"><BarChart3 className="h-4 w-4" /> Revenue Calculator</Button></Link>
            </div>
          </div>

          {/* ── RIGHT: 3D VIEWPORT ─────────────────────────── */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-teal/20">
              <div className="h-[520px] lg:h-[640px] min-h-[400px] relative">
                <ThreeScene
                  ref={sceneRef}
                  items={displayItems}
                  container={showContainer ? container : null}
                  showContainer={showContainer}
                  showHuman={showHuman}
                  darkMode={true}
                  packedMode={packedMode}
                />
                {/* Overlays */}
                {items.length > 0 && (
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400">{items.length} items · {round(totalWeight, 0)} kg</p>
                    <p className="text-xl font-bold">{round(totalCbm, 2)} <span className="text-xs font-normal text-slate-400">CBM</span></p>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 flex gap-1">
                  {CONTAINERS.map(c => (
                    <button key={c.type} onClick={() => { setContainerType(c.type); setPackedMode(false); setPackResult(null); }}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${containerType === c.type ? "bg-white text-black" : "bg-white/20 text-white hover:bg-white/30"}`}>
                      {c.type === "20gp" ? "20ft" : c.type === "40gp" ? "40ft" : "40ft HC"}
                    </button>
                  ))}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-black/50 text-white/80 text-[10px] backdrop-blur-sm">Drag to rotate · Scroll to zoom</Badge>
                </div>
              </div>
            </Card>

            {/* Container ref */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Container Dimensions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {CONTAINERS.map(c => (
                  <div key={c.type} className={`p-2.5 rounded-lg border text-xs transition-colors ${containerType === c.type ? "border-teal/30 bg-teal/5" : ""}`}>
                    <span className="font-semibold">{c.label}</span>
                    <span className="text-muted-foreground ml-2">{c.internalM.l}×{c.internalM.w}×{c.internalM.h}m · {c.cbm}m³ · {(c.maxKg / 1000).toFixed(1)}t max</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Auth Dialog ────────────────────────────────────── */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LogIn className="h-5 w-5 text-teal" /> {authMode === "signup" ? "Create Free Account" : "Log In"}</DialogTitle>
            <DialogDescription>Sign up to add unlimited items and save your configurations.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {authMode === "signup" && <div><Label className="text-xs">Name *</Label><Input value={authName} onChange={e => setAuthName(e.target.value)} className="mt-1" /></div>}
            <div><Label className="text-xs">Email *</Label><Input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="mt-1" /></div>
            <div><Label className="text-xs">Password *</Label><Input type="password" value={authPass} onChange={e => setAuthPass(e.target.value)} className="mt-1" /></div>
            {authMode === "signup" && <div><Label className="text-xs">Phone</Label><Input value={authPhone} onChange={e => setAuthPhone(e.target.value)} className="mt-1" /></div>}
            {authError && <p className="text-xs text-red-600">{authError}</p>}
            <Button onClick={handleAuth} className="w-full bg-teal hover:bg-teal/90 gap-2" disabled={authLoading}>
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {authMode === "signup" ? "Create Account" : "Log In"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {authMode === "signup" ? <>Have an account? <button onClick={() => setAuthMode("login")} className="text-teal underline">Log in</button></> : <>New? <button onClick={() => setAuthMode("signup")} className="text-teal underline">Sign up</button></>}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Quote Dialog ───────────────────────────────────── */}
      <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
        <DialogContent className="sm:max-w-md">
          <AnimatePresence mode="wait">
            {quoteStep === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2"><Send className="h-5 w-5 text-teal" /> Confirm Quote</DialogTitle>
                  <DialogDescription>We&apos;ll capture your 3D load plan and email it to you.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-3">
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Items</span><span className="font-medium">{items.length}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total CBM</span><span className="font-bold text-teal">{round(totalCbm, 4)} m³</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Weight</span><span className="font-medium">{round(totalWeight, 1)} kg</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Container</span><span className="font-medium">{container.label}</span></div>
                    {packedMode && packResult?.fits && <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="text-[10px]">Packed ✓</Badge></div>}
                  </div>
                  <div className="bg-teal/5 border border-teal/10 rounded-lg p-3 text-xs space-y-1">
                    <p className="font-medium text-teal flex items-center gap-1"><Mail className="h-3 w-3" /> You&apos;ll receive:</p>
                    <p className="text-muted-foreground">• 3D snapshot + item list in your email</p>
                    <p className="text-muted-foreground">• Link to review quote on your dashboard</p>
                    <p className="text-muted-foreground">• Team follow-up within 24 hours</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowQuoteDialog(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleSubmitQuote} className="flex-1 bg-teal hover:bg-teal/90 gap-2" disabled={quoteSubmitting}>
                      {quoteSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
            {quoteStep === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="text-center py-4 space-y-4">
                  <CheckCircle className="h-14 w-14 text-teal mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold">Quote Submitted! 🎉</h3>
                    <p className="text-sm text-muted-foreground mt-1">Quote <strong>{submittedQuoteNumber}</strong> emailed to <strong>{user?.email}</strong></p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/account/quotes" className="flex-1"><Button variant="outline" className="w-full">Review Quote</Button></Link>
                    <Button onClick={() => setShowQuoteDialog(false)} className="flex-1 bg-teal hover:bg-teal/90">Done</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
