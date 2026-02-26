"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package, Loader2, Ship, MapPin, Calendar, Truck, Clock, Check, Search as SearchIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface StatusHistory {
  status: string;
  note?: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  shippingMethod?: string;
  trackingId?: string;
  vessel?: string;
  destinationCity: string;
  estimatedDelivery?: string;
  items: { name: string; quantity: number }[];
  statusHistory: StatusHistory[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  sourcing: "bg-amber-500/10 text-amber-600",
  packing: "bg-indigo-500/10 text-indigo-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  customs: "bg-orange-500/10 text-orange-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  closed: "bg-gray-500/10 text-gray-600",
};

const statusIcons: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: Check,
  sourcing: Package,
  packing: Package,
  in_transit: Ship,
  customs: Package,
  delivered: Check,
  closed: Check,
};

const statusLabels: Record<string, string> = {
  pending: "Order Pending",
  confirmed: "Order Confirmed",
  sourcing: "Items Being Sourced",
  packing: "Packing & Loading",
  in_transit: "In Transit",
  customs: "Customs Clearance",
  delivered: "Delivered",
  closed: "Closed",
};

// All possible statuses in order for the progress bar
const allStatuses = ["pending", "confirmed", "sourcing", "packing", "in_transit", "customs", "delivered"];

export default function CustomerTrackingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((data) => {
        const activeOrders = (data.orders || []).filter(
          (o: Order) => !["closed", "cancelled"].includes(o.status)
        );
        setOrders(activeOrders);
        if (activeOrders.length > 0) setSelectedOrder(activeOrders[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusIndex = (status: string) => allStatuses.indexOf(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track Shipments</h1>
        <p className="text-muted-foreground">Monitor the status of your active shipments</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Truck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No active shipments</h3>
            <p className="text-muted-foreground">Your shipment tracking will appear here once an order is in progress.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Order selector */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase">Active Orders</h3>
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full text-left rounded-lg border p-3 transition-all ${
                  selectedOrder?.id === order.id ? "border-teal bg-teal/5 shadow-sm" : "border-border/50 hover:border-teal/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{order.orderNumber}</span>
                  <Badge className={statusColors[order.status] || ""} variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                </p>
              </button>
            ))}
          </div>

          {/* Tracking detail */}
          {selectedOrder && (
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Ship className="h-5 w-5 text-teal" />
                        {selectedOrder.orderNumber}
                      </h2>
                      <Badge className={statusColors[selectedOrder.status] || ""} variant="secondary" >
                        {statusLabels[selectedOrder.status] || selectedOrder.status}
                      </Badge>
                    </div>
                    {selectedOrder.estimatedDelivery && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                        <p className="font-bold text-teal">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{selectedOrder.destinationCity}</span></div>
                    {selectedOrder.shippingMethod && (
                      <div className="flex items-center gap-2"><Package className="h-4 w-4 text-muted-foreground" /><span>{selectedOrder.shippingMethod}</span></div>
                    )}
                    {selectedOrder.trackingId && (
                      <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-muted-foreground" /><span>Tracking: {selectedOrder.trackingId}</span></div>
                    )}
                    {selectedOrder.vessel && (
                      <div className="flex items-center gap-2"><Ship className="h-4 w-4 text-muted-foreground" /><span>Vessel: {selectedOrder.vessel}</span></div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progress Bar */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-4">Shipment Progress</h3>
                  <div className="flex items-center justify-between mb-6">
                    {allStatuses.map((status, i) => {
                      const currentIdx = getStatusIndex(selectedOrder.status);
                      const isDone = i < currentIdx;
                      const isCurrent = i === currentIdx;
                      const Icon = statusIcons[status] || Clock;
                      return (
                        <div key={status} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs ${
                              isDone ? "bg-teal text-white"
                                : isCurrent ? "bg-teal text-white animate-pulse"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                            </div>
                            <span className={`text-xs mt-1 text-center max-w-[70px] leading-tight ${isCurrent ? "font-medium text-teal" : "text-muted-foreground"}`}>
                              {statusLabels[status]?.split(" ").slice(0, 2).join(" ") || status}
                            </span>
                          </div>
                          {i < allStatuses.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-1 ${i < currentIdx ? "bg-teal" : "bg-muted"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Status History */}
              {selectedOrder.statusHistory.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-3">Status History</h3>
                    <div className="space-y-0">
                      {selectedOrder.statusHistory.map((h, i) => {
                        const Icon = statusIcons[h.status] || Clock;
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                                i === 0 ? "bg-teal text-white" : "bg-muted text-muted-foreground"
                              }`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              {i < selectedOrder.statusHistory.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[1.5rem] ${i === 0 ? "bg-teal" : "bg-muted"}`} />
                              )}
                            </div>
                            <div className="pb-4">
                              <Badge className={statusColors[h.status] || ""} variant="secondary">
                                {statusLabels[h.status] || h.status.replace(/_/g, " ")}
                              </Badge>
                              {h.note && <p className="text-sm mt-1">{h.note}</p>}
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Items */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-medium mb-3">Items in Shipment</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-teal" />
                        <span>{item.quantity}× {item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
