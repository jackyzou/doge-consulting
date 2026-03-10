"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/i18n";
import {
  Ship, Search, MapPin, Globe, Anchor, Navigation, ArrowRight, Clock,
  Package, ChevronDown, ChevronUp, ExternalLink, Loader2,
  Container, Route, Compass, AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";

/* ──────────────────────────────────────────
   STATIC DATA — Major Ports & Chokepoints
   ────────────────────────────────────────── */
const CHOKEPOINTS = [
  { id: "suez", name: "Suez Canal", lat: 30.46, lng: 32.35, zoom: 10, desc: "Connects Mediterranean to Red Sea — 12% of global trade" },
  { id: "panama", name: "Panama Canal", lat: 9.08, lng: -79.68, zoom: 10, desc: "Connects Atlantic to Pacific — 5% of global trade" },
  { id: "malacca", name: "Strait of Malacca", lat: 2.5, lng: 101.5, zoom: 7, desc: "Asia's busiest strait — 25% of world's oil" },
  { id: "gibraltar", name: "Strait of Gibraltar", lat: 35.96, lng: -5.35, zoom: 9, desc: "Gateway to Mediterranean — 200+ ships daily" },
  { id: "hormuz", name: "Strait of Hormuz", lat: 26.56, lng: 56.25, zoom: 8, desc: "Persian Gulf exit — 21% of global oil" },
  { id: "english", name: "English Channel", lat: 50.8, lng: 1.0, zoom: 8, desc: "Europe's busiest waterway — 500 ships daily" },
  { id: "scs", name: "South China Sea", lat: 15.0, lng: 115.0, zoom: 5, desc: "World's busiest shipping lane — $5.3T cargo/year" },
  { id: "gom", name: "Gulf of Mexico", lat: 25.0, lng: -90.0, zoom: 5, desc: "US energy imports & container traffic hub" },
];

const MAJOR_PORTS = [
  { name: "Shanghai", country: "CN", lat: 31.23, lng: 121.47, teu: "49.5M", rank: 1 },
  { name: "Singapore", country: "SG", lat: 1.26, lng: 103.84, teu: "39.0M", rank: 2 },
  { name: "Ningbo-Zhoushan", country: "CN", lat: 29.87, lng: 121.88, teu: "35.3M", rank: 3 },
  { name: "Shenzhen", country: "CN", lat: 22.54, lng: 114.05, teu: "30.0M", rank: 4 },
  { name: "Guangzhou", country: "CN", lat: 23.08, lng: 113.32, teu: "24.6M", rank: 5 },
  { name: "Busan", country: "KR", lat: 35.10, lng: 129.04, teu: "22.7M", rank: 6 },
  { name: "Qingdao", country: "CN", lat: 36.07, lng: 120.38, teu: "21.0M", rank: 7 },
  { name: "Los Angeles", country: "US", lat: 33.74, lng: -118.26, teu: "9.9M", rank: 13 },
  { name: "Long Beach", country: "US", lat: 33.77, lng: -118.19, teu: "9.1M", rank: 15 },
  { name: "Seattle/Tacoma", country: "US", lat: 47.27, lng: -122.35, teu: "3.4M", rank: 45 },
  { name: "Rotterdam", country: "NL", lat: 51.91, lng: 4.48, teu: "14.5M", rank: 10 },
  { name: "Dubai (Jebel Ali)", country: "AE", lat: 25.00, lng: 55.06, teu: "14.0M", rank: 11 },
];

// Demo route: Shenzhen → Seattle (Great Circle approximate)
const DEMO_ROUTE = [
  { lat: 22.54, lng: 114.05, port: "Shenzhen, China", day: 0 },
  { lat: 22.30, lng: 114.17, port: "Yantian Terminal", day: 1 },
  { lat: 21.50, lng: 116.00, port: "South China Sea", day: 2 },
  { lat: 25.00, lng: 122.00, port: "East China Sea", day: 4 },
  { lat: 33.00, lng: 140.00, port: "Pacific Ocean (Japan)", day: 7 },
  { lat: 40.00, lng: 160.00, port: "North Pacific", day: 10 },
  { lat: 45.00, lng: -170.00, port: "Mid-Pacific", day: 14 },
  { lat: 48.00, lng: -140.00, port: "Approaching NA Coast", day: 18 },
  { lat: 48.40, lng: -124.70, port: "Strait of Juan de Fuca", day: 21 },
  { lat: 47.60, lng: -122.34, port: "Seattle, WA", day: 22 },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  booked: { label: "Booked", color: "bg-slate-500" },
  loaded: { label: "Loaded", color: "bg-blue-500" },
  in_transit: { label: "In Transit", color: "bg-teal-500" },
  transshipment: { label: "Transshipment", color: "bg-amber-500" },
  arriving: { label: "Arriving", color: "bg-emerald-500" },
  discharged: { label: "Discharged", color: "bg-indigo-500" },
  customs: { label: "Customs", color: "bg-orange-500" },
  delivered: { label: "Delivered", color: "bg-green-600" },
};

export default function VesselTrackerPage() {
  const { t } = useTranslation();
  const [selectedChokepoint, setSelectedChokepoint] = useState<string | null>(null);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [trackingResults, setTrackingResults] = useState<TrackResult[] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showDemoRoute, setShowDemoRoute] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  type TrackResult = {
    id: string;
    containerNumber: string | null;
    containerType: string;
    billOfLading: string | null;
    voyageNumber: string | null;
    portOfLoading: string;
    portOfDischarge: string;
    etd: string | null;
    atd: string | null;
    eta: string | null;
    ata: string | null;
    status: string;
    grossWeightKg: number | null;
    volumeCbm: number | null;
    vessel: {
      name: string;
      imo: string | null;
      mmsi: string | null;
      flag: string | null;
      carrier: string | null;
      vesselType: string;
    } | null;
    events: {
      id: string;
      location: string;
      status: string;
      description: string | null;
      timestamp: string;
    }[];
    orderNumber: string | null;
  };

  // MarineTraffic embed URL (VesselFinder blocks iframes)
  const mapUrl = useMemo(() => {
    const cp = CHOKEPOINTS.find((c) => c.id === selectedChokepoint);
    if (cp) {
      return `https://www.marinetraffic.com/en/ais/embed/zoom:${cp.zoom}/centery:${cp.lat}/centerx:${cp.lng}/maptype:4/shownames:0/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:7/showmenu:0/remember:no`;
    }
    // Default: global view centered on Pacific
    return `https://www.marinetraffic.com/en/ais/embed/zoom:3/centery:20/centerx:140/maptype:4/shownames:0/mmsi:0/shipid:0/fleet:/fleet_id:/vtypes:7/showmenu:0/remember:no`;
  }, [selectedChokepoint]);

  const handleTrack = useCallback(async () => {
    if (!trackingQuery.trim()) return;
    setTrackingLoading(true);
    setTrackingResults(null);
    try {
      const res = await fetch(`/api/shipment/track?q=${encodeURIComponent(trackingQuery.trim())}`);
      const data = await res.json();
      setTrackingResults(data.shipments || []);
    } catch {
      setTrackingResults([]);
    } finally {
      setTrackingLoading(false);
    }
  }, [trackingQuery]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* ── Hero ── */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30 text-sm">
              <Ship className="mr-1.5 h-4 w-4" /> Live Vessel Tracker
            </Badge>
            <h1 className="text-3xl font-bold sm:text-5xl tracking-tight">
              Real-Time <span className="text-teal">Vessel Tracking</span> & Container Search
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Track vessels worldwide, monitor key shipping chokepoints, and search your container
              or bill of lading in real time.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 space-y-8 pb-20">
        {/* ── Container / B/L Search ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-900/90 border-slate-700 backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Search className="h-5 w-5 text-teal" />
                Container & B/L Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter container number (e.g. CSLU6543210) or Bill of Lading"
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 flex-1"
                />
                <Button onClick={handleTrack} disabled={trackingLoading} className="bg-teal hover:bg-teal/90 text-white shrink-0">
                  {trackingLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Track Shipment
                </Button>
              </div>

              {/* Results */}
              <AnimatePresence>
                {trackingResults !== null && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                    {trackingResults.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">No shipments found</p>
                        <p className="text-sm mt-1">Try a different container number or bill of lading</p>
                        <p className="text-xs mt-3 text-slate-500">
                          Demo: Track your Doge Consulting shipments by entering the container number provided by your account manager.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-slate-400">{trackingResults.length} shipment(s) found</p>
                        {trackingResults.map((r) => (
                          <ShipmentResultCard
                            key={r.id}
                            result={r}
                            expanded={expandedResult === r.id}
                            onToggle={() => setExpandedResult(expandedResult === r.id ? null : r.id)}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Live Vessel Map ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-slate-900/90 border-slate-700 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <Globe className="h-5 w-5 text-teal" />
                Live Vessel Map
              </CardTitle>
              <p className="text-xs text-slate-400">Real-time AIS vessel positions worldwide. Showing cargo vessels — zoom and pan to explore.</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full" style={{ height: 500 }}>
                <iframe
                  title="Live Vessel Traffic Map"
                  src={mapUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Quick-Zoom Chokepoints ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-teal" />
            Key Shipping Chokepoints
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CHOKEPOINTS.map((cp) => (
              <button
                key={cp.id}
                onClick={() => setSelectedChokepoint(selectedChokepoint === cp.id ? null : cp.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedChokepoint === cp.id
                    ? "bg-teal/20 border-teal text-white"
                    : "bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <Anchor className="h-5 w-5 mb-2 text-teal" />
                <p className="font-semibold text-sm">{cp.name}</p>
                <p className="text-xs mt-1 text-slate-400 line-clamp-2">{cp.desc}</p>
              </button>
            ))}
          </div>
          {selectedChokepoint && (
            <p className="mt-3 text-sm text-teal">
              🗺️ Map zoomed to: <strong>{CHOKEPOINTS.find((c) => c.id === selectedChokepoint)?.name}</strong>
              <button onClick={() => setSelectedChokepoint(null)} className="ml-3 text-slate-400 hover:text-white underline">
                Reset to Global View
              </button>
            </p>
          )}
        </motion.div>

        {/* ── Demo Route Animation ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-slate-900/90 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Route className="h-5 w-5 text-teal" />
                Sample Route: Shenzhen → Seattle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <Button
                  onClick={() => setShowDemoRoute(!showDemoRoute)}
                  variant="outline"
                  className="border-teal/50 text-teal hover:bg-teal/10"
                >
                  {showDemoRoute ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                  {showDemoRoute ? "Hide Route" : "Show 22-Day Voyage"}
                </Button>
                <span className="text-sm text-slate-400">~6,500 nautical miles · 22 transit days</span>
              </div>

              <AnimatePresence>
                {showDemoRoute && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal via-teal/50 to-teal" />

                      {DEMO_ROUTE.map((point, i) => (
                        <motion.div
                          key={point.port}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="relative flex items-center gap-4 py-3"
                        >
                          <div className={`relative z-10 h-3 w-3 rounded-full border-2 ${
                            i === 0 || i === DEMO_ROUTE.length - 1
                              ? "bg-teal border-teal shadow-lg shadow-teal/50"
                              : "bg-slate-800 border-teal/50"
                          }`} style={{ marginLeft: "18px" }} />
                          <div className="flex-1 flex items-center justify-between">
                            <div>
                              <p className="text-white font-medium text-sm">{point.port}</p>
                              <p className="text-xs text-slate-400">
                                {point.lat.toFixed(1)}°{point.lat > 0 ? "N" : "S"}, {Math.abs(point.lng).toFixed(1)}°{point.lng > 0 ? "E" : "W"}
                              </p>
                            </div>
                            <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                              Day {point.day}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Top Ports by TEU ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Container className="h-5 w-5 text-teal" />
            World&apos;s Busiest Container Ports
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MAJOR_PORTS.map((port) => (
              <Card key={port.name} className="bg-slate-800/60 border-slate-700 hover:border-teal/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-teal">#{port.rank}</span>
                      <div>
                        <p className="text-white font-semibold">{port.name}</p>
                        <p className="text-xs text-slate-400">{port.country}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {port.teu} TEU
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* ── SEO Content: How Vessel Tracking Works ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Compass className="h-6 w-6 text-teal" />
              How Vessel Tracking Works
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/80 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Globe className="h-4 w-4 text-teal" /> AIS Technology
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    Modern vessel tracking relies on the <strong className="text-white">Automatic Identification System (AIS)</strong> —
                    a transponder required on all commercial vessels over 300 gross tons. AIS broadcasts
                    a ship&apos;s position, speed, course, and identity every few seconds via VHF radio.
                  </p>
                  <p>
                    Every vessel has a unique <strong className="text-white">MMSI</strong> number for radio
                    communications and an <strong className="text-white">IMO number</strong> for lifelong identification.
                    Container ships typically travel at <strong className="text-white">12–25 knots</strong> (22–46 km/h).
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Route className="h-4 w-4 text-teal" /> China → USA Routes
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  {[
                    { route: "Shenzhen → Los Angeles", days: "14–18 days", type: "Trans-Pacific Direct" },
                    { route: "Shenzhen → Seattle/Tacoma", days: "18–22 days", type: "Trans-Pacific PNW" },
                    { route: "Shanghai → New York", days: "30–35 days", type: "Via Panama Canal" },
                    { route: "Shanghai → Savannah", days: "28–33 days", type: "Via Suez Canal" },
                  ].map((r) => (
                    <div key={r.route} className="flex items-center justify-between py-1.5 border-b border-slate-700 last:border-0">
                      <div>
                        <p className="text-white font-medium">{r.route}</p>
                        <p className="text-xs text-slate-400">{r.type}</p>
                      </div>
                      <Badge variant="outline" className="border-teal/30 text-teal text-xs">{r.days}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-slate-600 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Container className="h-4 w-4 text-teal" /> Common Container Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[
                      { type: "20GP", vol: "33.2 CBM", desc: "Small shipments" },
                      { type: "40GP", vol: "67.7 CBM", desc: "Most common" },
                      { type: "40HC", vol: "76.3 CBM", desc: "Furniture / tall items" },
                      { type: "45HC", vol: "86.0 CBM", desc: "Oversized cargo" },
                      { type: "40RF", vol: "67.7 CBM", desc: "Refrigerated" },
                    ].map((c) => (
                      <div key={c.type} className="bg-slate-900/60 rounded-lg p-3 text-center border border-slate-700">
                        <p className="text-teal font-bold text-lg">{c.type}</p>
                        <p className="text-white text-sm font-medium mt-1">{c.vol}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/quote">
                <Button size="lg" className="bg-teal hover:bg-teal/90 text-white">
                  Get a Shipping Quote <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tools/cbm-calculator">
                <Button size="lg" variant="outline" className="border-teal/50 text-teal hover:bg-teal/10">
                  CBM Calculator <Package className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Shipment Result Card ── */
function ShipmentResultCard({
  result,
  expanded,
  onToggle,
}: {
  result: {
    id: string;
    containerNumber: string | null;
    containerType: string;
    billOfLading: string | null;
    voyageNumber: string | null;
    portOfLoading: string;
    portOfDischarge: string;
    etd: string | null;
    atd: string | null;
    eta: string | null;
    ata: string | null;
    status: string;
    grossWeightKg: number | null;
    volumeCbm: number | null;
    vessel: { name: string; imo: string | null; flag: string | null; carrier: string | null } | null;
    events: { id: string; location: string; status: string; description: string | null; timestamp: string }[];
    orderNumber: string | null;
  };
  expanded: boolean;
  onToggle: () => void;
}) {
  const st = STATUS_LABELS[result.status] || { label: result.status, color: "bg-slate-500" };

  // Progress percentage
  const statusOrder = ["booked", "loaded", "in_transit", "transshipment", "arriving", "discharged", "customs", "delivered"];
  const progress = Math.round(((statusOrder.indexOf(result.status) + 1) / statusOrder.length) * 100);

  return (
    <Card className="bg-slate-800/80 border-slate-600 overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 text-left hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ship className="h-5 w-5 text-teal shrink-0" />
            <div>
              <p className="text-white font-semibold">
                {result.containerNumber || result.billOfLading || "Shipment"}
              </p>
              <p className="text-xs text-slate-400">
                {result.portOfLoading} → {result.portOfDischarge}
                {result.vessel && ` · ${result.vessel.name}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${st.color} text-white text-xs`}>{st.label}</Badge>
            {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-slate-700">
              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <InfoCell label="Container" value={result.containerNumber || "—"} />
                <InfoCell label="Type" value={result.containerType} />
                <InfoCell label="B/L" value={result.billOfLading || "—"} />
                <InfoCell label="Voyage" value={result.voyageNumber || "—"} />
                <InfoCell label="ETD" value={result.etd ? new Date(result.etd).toLocaleDateString() : "—"} />
                <InfoCell label="ATD" value={result.atd ? new Date(result.atd).toLocaleDateString() : "—"} />
                <InfoCell label="ETA" value={result.eta ? new Date(result.eta).toLocaleDateString() : "—"} />
                <InfoCell label="ATA" value={result.ata ? new Date(result.ata).toLocaleDateString() : "—"} />
                {result.grossWeightKg && <InfoCell label="Weight" value={`${result.grossWeightKg.toLocaleString()} kg`} />}
                {result.volumeCbm && <InfoCell label="Volume" value={`${result.volumeCbm} CBM`} />}
                {result.vessel?.carrier && <InfoCell label="Carrier" value={result.vessel.carrier} />}
                {result.vessel?.flag && <InfoCell label="Flag" value={result.vessel.flag} />}
              </div>

              {/* Event timeline */}
              {result.events.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-teal" /> Tracking Events
                  </h4>
                  <div className="relative ml-3">
                    <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-slate-700" />
                    {result.events.map((evt, i) => (
                      <div key={evt.id} className="relative flex items-start gap-3 pb-4">
                        <div className={`relative z-10 h-3 w-3 rounded-full mt-1 ${
                          i === 0 ? "bg-teal border-2 border-teal shadow-lg shadow-teal/30" : "bg-slate-700 border border-slate-600"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-white font-medium">{evt.location}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(evt.timestamp).toLocaleDateString()} {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {evt.description || evt.status.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white font-medium mt-0.5">{value}</p>
    </div>
  );
}
