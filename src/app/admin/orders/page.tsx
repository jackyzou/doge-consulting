"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Package, Search, MapPin, Calendar, DollarSign, Eye, Edit,
  Loader2, FileDown, CreditCard, Clock,
} from "lucide-react";
import { toast } from "sonner";

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
  customerEmail: string;
  customerPhone?: string;
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

const allStatuses = ["pending", "confirmed", "sourcing", "packing", "in_transit", "customs", "delivered", "closed"];
const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  sourcing: "bg-amber-500/10 text-amber-600",
  packing: "bg-indigo-500/10 text-indigo-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  customs: "bg-orange-500/10 text-orange-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  closed: "bg-gray-500/10 text-gray-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showDetail, setShowDetail] = useState<Order | null>(null);
  const [showStatusUpdate, setShowStatusUpdate] = useState<Order | null>(null);
  const [showPayment, setShowPayment] = useState<Order | null>(null);

  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState("credit_card");
  const [payType, setPayType] = useState("deposit");
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [statusFilter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async () => {
    if (!showStatusUpdate || !newStatus) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${showStatusUpdate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note: statusNote }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Order status updated!");
      setShowStatusUpdate(null);
      setNewStatus("");
      setStatusNote("");
      fetchOrders();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
    setSaving(false);
  };

  const handleRecordPayment = async () => {
    if (!showPayment || payAmount <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: showPayment.id, amount: payAmount, method: payMethod, type: payType }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Payment recorded!");
      setShowPayment(null);
      setPayAmount(0);
      fetchOrders();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to record payment");
    }
    setSaving(false);
  };

  const handleGenerateDoc = async (orderId: string, type: string) => {
    try {
      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, type }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${orderId.slice(0, 8)}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${type} PDF downloaded!`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to generate document");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders & Shipments</h1>
          <p className="text-muted-foreground">Track and manage all orders</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Package className="h-3 w-3" />
          {orders.filter((o) => !["delivered", "closed", "cancelled"].includes(o.status)).length} active
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-lg font-bold text-teal">{order.orderNumber}</span>
                      <Badge className={statusColors[order.status]} variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
                      <span className="text-sm text-muted-foreground">· {order.customerName}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items?.map((item) => (
                        <Badge key={item.name} variant="outline" className="text-xs">{item.name} ×{item.quantity}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.destinationCity}</span>
                      {order.estimatedDelivery && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ETA: {new Date(order.estimatedDelivery).toLocaleDateString()}</span>}
                      {order.shippingMethod && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{order.shippingMethod}</span>}
                      {order.trackingId && <span>Tracking: {order.trackingId}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold">${order.totalAmount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <DollarSign className="h-3 w-3" />
                        Balance: ${order.balanceDue.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowDetail(order)}><Eye className="h-3 w-3" />View</Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => { setShowStatusUpdate(order); setNewStatus(order.status); }}><Edit className="h-3 w-3" />Status</Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => { setShowPayment(order); setPayAmount(order.balanceDue); }}><CreditCard className="h-3 w-3" />Pay</Button>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleGenerateDoc(order.id, "invoice")}><FileDown className="h-3 w-3" />Invoice</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="py-8 text-center text-muted-foreground">No orders found.</p>}
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
                  <Badge className={statusColors[showDetail.status]} variant="secondary">{showDetail.status.replace(/_/g, " ")}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{showDetail.customerName}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> {showDetail.customerEmail}</div>
                  <div><span className="text-muted-foreground">Total:</span> <span className="font-bold">${showDetail.totalAmount.toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Balance:</span> <span className="font-bold text-amber-600">${showDetail.balanceDue.toLocaleString()}</span></div>
                  {showDetail.trackingId && <div><span className="text-muted-foreground">Tracking:</span> {showDetail.trackingId}</div>}
                  {showDetail.vessel && <div><span className="text-muted-foreground">Vessel:</span> {showDetail.vessel}</div>}
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
                      {showDetail.items?.map((it, i) => (
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
                          <div className="text-right">
                            <span className="font-medium">${p.amount.toLocaleString()}</span>
                            <Badge className="ml-2" variant="secondary">{p.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status History */}
                {showDetail.statusHistory?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Status History</h4>
                    <div className="space-y-2">
                      {showDetail.statusHistory.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <Badge className={statusColors[h.status]} variant="secondary">{h.status.replace(/_/g, " ")}</Badge>
                            {h.note && <span className="ml-2">{h.note}</span>}
                            <p className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleString()} · {h.changedBy}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => handleGenerateDoc(showDetail.id, "invoice")} className="gap-1"><FileDown className="h-4 w-4" />Invoice</Button>
                <Button variant="outline" onClick={() => handleGenerateDoc(showDetail.id, "receipt")} className="gap-1"><FileDown className="h-4 w-4" />Receipt</Button>
                <Button variant="outline" onClick={() => handleGenerateDoc(showDetail.id, "purchase_order")} className="gap-1"><FileDown className="h-4 w-4" />PO</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={!!showStatusUpdate} onOpenChange={() => setShowStatusUpdate(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Order Status</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allStatuses.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note</Label>
              <Textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="mt-1" rows={2} placeholder="Add a note about this status change..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusUpdate(null)}>Cancel</Button>
            <Button onClick={handleStatusUpdate} disabled={saving} className="bg-teal hover:bg-teal/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          {showPayment && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Order: <span className="font-medium text-foreground">{showPayment.orderNumber}</span> · Balance: <span className="font-bold">${showPayment.balanceDue.toLocaleString()}</span></p>
              <div>
                <Label>Amount ($)</Label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Type</Label>
                <Select value={payType} onValueChange={setPayType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="balance">Balance</SelectItem>
                    <SelectItem value="full">Full Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayment(null)}>Cancel</Button>
            <Button onClick={handleRecordPayment} disabled={saving} className="bg-teal hover:bg-teal/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
