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
  FileText, Search, Plus, Eye, Send, ArrowRightLeft, Trash2, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";

interface QuoteItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unit: string;
  productId?: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCompany?: string;
  subtotal: number;
  shippingCost: number;
  insuranceCost: number;
  customsDuty: number;
  discount: number;
  totalAmount: number;
  shippingMethod?: string;
  estimatedTransit?: string;
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  unit: string;
  sku: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600",
  sent: "bg-blue-500/10 text-blue-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  expired: "bg-orange-500/10 text-orange-600",
  converted: "bg-teal-500/10 text-teal-600",
};

const emptyItem: QuoteItem = { name: "", quantity: 1, unitPrice: 0, totalPrice: 0, unit: "piece" };

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<Quote | null>(null);
  const [saving, setSaving] = useState(false);

  // Create form
  const [form, setForm] = useState({
    customerName: "", customerEmail: "", customerPhone: "", customerCompany: "",
    shippingMethod: "LCL", shippingCost: 0, insuranceCost: 0, customsDuty: 0, discount: 0,
    notes: "",
  });
  const [items, setItems] = useState<QuoteItem[]>([{ ...emptyItem }]);

  const fetchQuotes = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    if (search) params.set("search", search);
    fetch(`/api/admin/quotes?${params}`)
      .then((r) => r.json())
      .then((data) => setQuotes(data.quotes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);
  useEffect(() => {
    fetch("/api/admin/products").then((r) => r.json()).then((d) => setProducts(d.products || []));
  }, []);

  const addItem = () => setItems([...items, { ...emptyItem }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[i] as unknown as Record<string, unknown>)[field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updated[i].totalPrice = updated[i].quantity * updated[i].unitPrice;
    }
    setItems(updated);
  };

  const selectProduct = (i: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updated = [...items];
    updated[i] = { ...updated[i], productId, name: product.name, unitPrice: product.unitPrice, unit: product.unit, totalPrice: product.unitPrice * updated[i].quantity };
    setItems(updated);
  };

  const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);

  const handleCreate = async () => {
    if (!form.customerName || !form.customerEmail || items.length === 0 || !items[0].name) {
      toast.error("Fill in customer details and at least one item");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Quote created!");
      setShowCreate(false);
      setForm({ customerName: "", customerEmail: "", customerPhone: "", customerCompany: "", shippingMethod: "LCL", shippingCost: 0, insuranceCost: 0, customsDuty: 0, discount: 0, notes: "" });
      setItems([{ ...emptyItem }]);
      fetchQuotes();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create quote");
    }
    setSaving(false);
  };

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(action === "send" ? "Quote sent to customer!" : "Quote converted to order!");
      fetchQuotes();
      setShowDetail(null);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    try {
      await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
      toast.success("Quote deleted");
      fetchQuotes();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = quotes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotes / Purchase Orders</h1>
          <p className="text-muted-foreground">Create and manage customer quotes</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-teal hover:bg-teal/90 gap-2">
          <Plus className="h-4 w-4" />New Quote
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "draft", "sent", "accepted", "converted", "rejected"].map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "bg-teal hover:bg-teal/90" : ""}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Quote #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Items</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Shipping</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium text-teal">{q.quoteNumber}</td>
                      <td className="py-3">
                        <p className="font-medium">{q.customerName}</p>
                        <p className="text-xs text-muted-foreground">{q.customerEmail}</p>
                      </td>
                      <td className="py-3 hidden md:table-cell">{q.items?.length || 0} items</td>
                      <td className="py-3 hidden sm:table-cell">{q.shippingMethod || "—"}</td>
                      <td className="py-3 text-right font-medium">${q.totalAmount.toLocaleString()}</td>
                      <td className="py-3">
                        <Badge className={statusColors[q.status]} variant="secondary">{q.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowDetail(q)}><Eye className="h-4 w-4" /></Button>
                          {q.status === "draft" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleAction(q.id, "send")}><Send className="h-4 w-4" /></Button>
                          )}
                          {(q.status === "sent" || q.status === "accepted") && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-teal" onClick={() => handleAction(q.id, "convert")}><ArrowRightLeft className="h-4 w-4" /></Button>
                          )}
                          {q.status === "draft" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(q.id)}><Trash2 className="h-4 w-4" /></Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <p className="py-8 text-center text-muted-foreground">No quotes found.</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Quote Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Create New Quote</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Customer Name *</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="mt-1" /></div>
              <div><Label>Email *</Label><Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className="mt-1" /></div>
              <div><Label>Phone</Label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="mt-1" /></div>
              <div><Label>Company</Label><Input value={form.customerCompany} onChange={(e) => setForm({ ...form, customerCompany: e.target.value })} className="mt-1" /></div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Line Items</h3>
                <Button variant="outline" size="sm" onClick={addItem} className="gap-1"><Plus className="h-3 w-3" />Add Item</Button>
              </div>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 mb-2 items-end">
                  <div className="flex-1">
                    {i === 0 && <Label className="text-xs">Product</Label>}
                    <Select onValueChange={(v) => selectProduct(i, v)}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select or type..." /></SelectTrigger>
                      <SelectContent>
                        {products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name} (${p.unitPrice})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20">
                    {i === 0 && <Label className="text-xs">Qty</Label>}
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(i, "quantity", Number(e.target.value))} className="mt-1" />
                  </div>
                  <div className="w-28">
                    {i === 0 && <Label className="text-xs">Unit Price</Label>}
                    <Input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))} className="mt-1" />
                  </div>
                  <div className="w-24 text-right">
                    {i === 0 && <Label className="text-xs">Total</Label>}
                    <p className="py-2 font-medium">${item.totalPrice.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => removeItem(i)} disabled={items.length === 1}><X className="h-4 w-4" /></Button>
                </div>
              ))}
              <p className="text-right font-medium mt-2">Subtotal: ${subtotal.toLocaleString()}</p>
            </div>

            <div className="border-t pt-4 grid grid-cols-2 gap-4">
              <div>
                <Label>Shipping Method</Label>
                <Select value={form.shippingMethod} onValueChange={(v) => setForm({ ...form, shippingMethod: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LCL">LCL</SelectItem>
                    <SelectItem value="FCL_20GP">FCL 20GP</SelectItem>
                    <SelectItem value="FCL_40GP">FCL 40GP</SelectItem>
                    <SelectItem value="FCL_40HC">FCL 40HC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Shipping Cost</Label><Input type="number" value={form.shippingCost} onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Insurance</Label><Input type="number" value={form.insuranceCost} onChange={(e) => setForm({ ...form, insuranceCost: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Customs Duty</Label><Input type="number" value={form.customsDuty} onChange={(e) => setForm({ ...form, customsDuty: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Discount</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: Number(e.target.value) })} className="mt-1" /></div>
            </div>

            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-teal hover:bg-teal/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Create Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal" />
                  {showDetail.quoteNumber}
                  <Badge className={statusColors[showDetail.status]} variant="secondary">{showDetail.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{showDetail.customerName}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{showDetail.customerEmail}</span></div>
                  {showDetail.customerPhone && <div><span className="text-muted-foreground">Phone:</span> {showDetail.customerPhone}</div>}
                  {showDetail.customerCompany && <div><span className="text-muted-foreground">Company:</span> {showDetail.customerCompany}</div>}
                  {showDetail.shippingMethod && <div><span className="text-muted-foreground">Shipping:</span> {showDetail.shippingMethod}</div>}
                  {showDetail.estimatedTransit && <div><span className="text-muted-foreground">Transit:</span> {showDetail.estimatedTransit}</div>}
                </div>
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
                <div className="text-sm space-y-1 text-right">
                  <p>Subtotal: ${showDetail.subtotal.toLocaleString()}</p>
                  {showDetail.shippingCost > 0 && <p>Shipping: ${showDetail.shippingCost.toLocaleString()}</p>}
                  {showDetail.insuranceCost > 0 && <p>Insurance: ${showDetail.insuranceCost.toLocaleString()}</p>}
                  {showDetail.customsDuty > 0 && <p>Customs: ${showDetail.customsDuty.toLocaleString()}</p>}
                  {showDetail.discount > 0 && <p className="text-red-500">Discount: -${showDetail.discount.toLocaleString()}</p>}
                  <p className="text-lg font-bold">Total: ${showDetail.totalAmount.toLocaleString()}</p>
                </div>
                {showDetail.notes && <p className="text-sm text-muted-foreground border-t pt-2">{showDetail.notes}</p>}
              </div>
              <DialogFooter className="gap-2">
                {showDetail.status === "draft" && (
                  <Button onClick={() => handleAction(showDetail.id, "send")} className="bg-blue-600 hover:bg-blue-700 gap-1"><Send className="h-4 w-4" />Send to Customer</Button>
                )}
                {(showDetail.status === "sent" || showDetail.status === "accepted") && (
                  <Button onClick={() => handleAction(showDetail.id, "convert")} className="bg-teal hover:bg-teal/90 gap-1"><ArrowRightLeft className="h-4 w-4" />Convert to Order</Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
