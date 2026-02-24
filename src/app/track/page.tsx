"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, Ship, Check, Clock, MapPin, Truck, AlertCircle } from "lucide-react";
import { getShipmentByTrackingId, type Shipment } from "@/lib/tracking";

const statusIcons: Record<string, React.ElementType> = {
  order_confirmed: Check,
  furniture_sourced: Package,
  quality_inspected: Search,
  packed_foshan: Package,
  departed_china: Ship,
  in_transit: Ship,
  arrived_seattle: MapPin,
  customs_cleared: Check,
  out_for_delivery: Truck,
  delivered: Check,
};

export default function TrackPage() {
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const result = getShipmentByTrackingId(trackingId.trim().toUpperCase());
    setShipment(result);
  };

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Real-Time Updates</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">Track Your Shipment</h1>
            <p className="mt-3 text-slate-300">Enter your tracking ID to see live shipment status.</p>

            <div className="mt-8 flex gap-2 mx-auto max-w-md">
              <Input
                placeholder="e.g. DC-2026-001"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button onClick={handleSearch} className="bg-teal text-white hover:bg-teal/90 shrink-0">
                <Search className="mr-2 h-4 w-4" /> Track
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">Demo IDs: DC-2026-001, DC-2026-002</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {searched && !shipment && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Shipment Not Found</h3>
              <p className="text-muted-foreground">Please check your tracking ID and try again.</p>
            </motion.div>
          )}

          {shipment && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Shipment Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Ship className="h-5 w-5 text-teal" />
                      {shipment.trackingId}
                    </CardTitle>
                    <Badge className="bg-teal/10 text-teal border-teal/20">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Origin</span><span className="font-medium">{shipment.origin}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Destination</span><span className="font-medium">{shipment.destination}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{shipment.method}</span></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Total CBM</span><span className="font-medium">{shipment.totalCBM}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{shipment.totalWeight} kg</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Est. Delivery</span><span className="font-medium text-teal">{shipment.estimatedDelivery}</span></div>
                    </div>
                  </div>
                  {shipment.vesselName && (
                    <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                      <span className="text-muted-foreground">Vessel: </span>
                      <span className="font-medium">{shipment.vesselName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader><CardTitle className="text-base">Items ({shipment.items.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {shipment.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-teal" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader><CardTitle className="text-base">Shipment Timeline</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    {shipment.milestones.map((milestone, i) => {
                      const Icon = statusIcons[milestone.status] || Clock;
                      return (
                        <div key={milestone.status} className="flex gap-4">
                          {/* Vertical line + dot */}
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              milestone.completed
                                ? "bg-teal text-white"
                                : milestone.active
                                ? "bg-teal text-white animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            {i < shipment.milestones.length - 1 && (
                              <div className={`w-0.5 flex-1 min-h-[2rem] ${milestone.completed ? "bg-teal" : "bg-muted"}`} />
                            )}
                          </div>
                          {/* Content */}
                          <div className="pb-6">
                            <p className={`font-medium text-sm ${milestone.completed || milestone.active ? "text-foreground" : "text-muted-foreground"}`}>
                              {milestone.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{milestone.description}</p>
                            {milestone.date && (
                              <p className="text-xs text-teal mt-1">{milestone.date}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
