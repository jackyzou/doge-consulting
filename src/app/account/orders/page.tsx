"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Package, Loader2, Eye, MapPin, Calendar, Clock, Ship, Truck, Check,
} from "lucide-react";
import Link from "next/link";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface StatusHistory {
  status: string;
  note?: string;
  changedBy?: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  depositAmount: number;
  balanceDue: number;
  shippingMethod?: string;
  trackingId?: string;
  vessel?: string;
  destinationCity: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments: { id: string; paymentNumber: string; amount: number; method: string; status: string; paidAt?: string }[];
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

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/api/customer/orders")
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track your orders and shipments</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground">Your orders will appear here once a quote is converted.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-lg font-bold text-teal">{order.orderNumber}</span>
                      <Badge className={statusColors[order.status] || ""} variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <Badge key={item.name} variant="outline" className="text-xs">{item.name} ×{item.quantity}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.destinationCity}</span>
                      {order.estimatedDelivery && (
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                      )}
                      {order.trackingId && (
                        <Link href={`/track?id=${order.trackingId}`} className="flex items-center gap-1 text-teal hover:underline">
                          <Truck className="h-3 w-3" />Track: {order.trackingId}
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold">${order.totalAmount.toLocaleString()}</p>
                      {order.balanceDue > 0 && (
                        <p className="text-xs text-amber-600">Balance: ${order.balanceDue.toLocaleString()}</p>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowDetail(order)} className="gap-1">
                      <Eye className="h-3 w-3" />View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-teal" />
                  {showDetail.orderNumber}
                  <Badge className={statusColors[showDetail.status] || ""} variant="secondary">{showDetail.status.replace(/_/g, " ")}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Destination:</span> <span className="font-medium">{showDetail.destinationCity}</span></div>
                  <div><span className="text-muted-foreground">Shipping:</span> <span className="font-medium">{showDetail.shippingMethod || "N/A"}</span></div>
                  <div><span className="text-muted-foreground">Total:</span> <span className="font-bold">${showDetail.totalAmount.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Balance Due:</span> <span className="font-bold text-amber-600">${showDetail.balanceDue.toLocaleString()}</span></div>
                  {showDetail.trackingId && <div><span className="text-muted-foreground">Tracking:</span> <span className="font-medium">{showDetail.trackingId}</span></div>}
                  {showDetail.vessel && <div><span className="text-muted-foreground">Vessel:</span> <span className="font-medium">{showDetail.vessel}</span></div>}
                  {showDetail.estimatedDelivery && <div><span className="text-muted-foreground">ETA:</span> <span className="font-medium text-teal">{new Date(showDetail.estimatedDelivery).toLocaleDateString()}</span></div>}
                </div>

                {/* Items */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {showDetail.items.map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">${it.unitPrice.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-medium">${it.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Payments */}
                {showDetail.payments?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Payments</h4>
                    <div className="space-y-2">
                      {showDetail.payments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                          <div>
                            <span className="font-medium">{p.paymentNumber}</span>
                            <span className="ml-2 text-muted-foreground">{p.method.replace(/_/g, " ")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${p.amount.toLocaleString()}</span>
                            <Badge variant="secondary">{p.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                {showDetail.statusHistory?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Shipment Timeline</h4>
                    <div className="space-y-0">
                      {showDetail.statusHistory.map((h, i) => {
                        const Icon = statusIcons[h.status] || Clock;
                        return (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${i === 0 ? "bg-teal text-white" : "bg-muted text-muted-foreground"}`}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              {i < showDetail.statusHistory.length - 1 && (
                                <div className={`w-0.5 flex-1 min-h-[1.5rem] ${i === 0 ? "bg-teal" : "bg-muted"}`} />
                              )}
                            </div>
                            <div className="pb-4">
                              <Badge className={statusColors[h.status] || ""} variant="secondary">{h.status.replace(/_/g, " ")}</Badge>
                              {h.note && <p className="text-sm mt-1">{h.note}</p>}
                              <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
