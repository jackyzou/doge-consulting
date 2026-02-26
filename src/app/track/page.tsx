"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Package, Ship, Check, Clock, MapPin, Truck, AlertCircle } from "lucide-react";
import { getShipmentByTrackingId, type Shipment } from "@/lib/tracking";
import { useTranslation } from "@/lib/i18n";

const statusIcons: Record<string, React.ElementType> = {
  order_confirmed: Check,
  items_sourced: Package,
  quality_inspected: Search,
  packed_shenzhen: Package,
  departed_china: Ship,
  in_transit: Ship,
  arrived_seattle: MapPin,
  customs_cleared: Check,
  out_for_delivery: Truck,
  delivered: Check,
};

export default function TrackPage() {
  const { t } = useTranslation();
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [searched, setSearched] = useState(false);

  const milestoneLabels: Record<string, string> = {
    "Order Confirmed": t("trackPage.orderConfirmed"),
    "Items Sourced": t("trackPage.itemsSourced"),
    "Quality Inspected": t("trackPage.qualityInspected"),
    "Packed & Loaded": t("trackPage.packedLoaded"),
    "Departed China": t("trackPage.departedChina"),
    "In Transit": t("trackPage.inTransit"),
    "Arrived Seattle": t("trackPage.arrivedSeattle"),
    "Customs Cleared": t("trackPage.customsCleared"),
    "Out for Delivery": t("trackPage.outForDelivery"),
    "Delivered": t("trackPage.delivered"),
  };
  const milestoneDescs: Record<string, string> = {
    "Order Confirmed": t("trackPage.orderConfirmedDesc"),
    "Items Sourced": t("trackPage.itemsSourcedDesc"),
    "Quality Inspected": t("trackPage.qualityInspectedDesc"),
    "Packed & Loaded": t("trackPage.packedLoadedDesc"),
    "Departed China": t("trackPage.departedChinaDesc"),
    "In Transit": t("trackPage.inTransitDesc"),
    "Arrived Seattle": t("trackPage.arrivedSeattleDesc"),
    "Customs Cleared": t("trackPage.customsClearedDesc"),
    "Out for Delivery": t("trackPage.outForDeliveryDesc"),
    "Delivered": t("trackPage.deliveredDesc"),
  };

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
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("trackPage.badge")}</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("trackPage.title")}</h1>
            <p className="mt-3 text-slate-300">{t("trackPage.subtitle")}</p>

            <div className="mt-8 flex gap-2 mx-auto max-w-md">
              <Input
                placeholder={t("trackPage.placeholder")}
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button onClick={handleSearch} className="bg-teal text-white hover:bg-teal/90 shrink-0">
                <Search className="mr-2 h-4 w-4" /> {t("trackPage.trackBtn")}
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-400">{t("trackPage.demoIds")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {searched && !shipment && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">{t("trackPage.notFoundTitle")}</h3>
              <p className="text-muted-foreground">{t("trackPage.notFoundDesc")}</p>
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
                    <Badge className="bg-teal/10 text-teal border-teal/20">{t("trackPage.inProgress")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.origin")}</span><span className="font-medium">{shipment.origin}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.destination")}</span><span className="font-medium">{shipment.destination}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.method")}</span><span className="font-medium">{shipment.method}</span></div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.totalCBM")}</span><span className="font-medium">{shipment.totalCBM}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.weight")}</span><span className="font-medium">{shipment.totalWeight} kg</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("trackPage.estDelivery")}</span><span className="font-medium text-teal">{shipment.estimatedDelivery}</span></div>
                    </div>
                  </div>
                  {shipment.vesselName && (
                    <div className="mt-4 rounded-lg bg-muted p-3 text-sm">
                      <span className="text-muted-foreground">{t("trackPage.vessel")} </span>
                      <span className="font-medium">{shipment.vesselName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader><CardTitle className="text-base">{t("trackPage.items")} ({shipment.items.length})</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="text-base">{t("trackPage.timeline")}</CardTitle></CardHeader>
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
                              {milestoneLabels[milestone.label] || milestone.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{milestoneDescs[milestone.label] || milestone.description}</p>
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
