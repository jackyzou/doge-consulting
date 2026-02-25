"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, Plus, Edit, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  sku: string;
  unitPrice: number;
  unit: string;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  weightKg?: number;
  isActive: boolean;
  isCatalog: boolean;
}

const categories = ["furniture", "electronics", "home-goods", "textile", "lighting", "custom"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", category: "furniture", sku: "", unitPrice: 0, unit: "piece",
    lengthCm: 0, widthCm: 0, heightCm: 0, weightKg: 0, isActive: true, isCatalog: false,
  });

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (catFilter !== "all") params.set("category", catFilter);
    if (search) params.set("search", search);
    fetch(`/api/admin/products?${params}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [catFilter, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetForm = () => {
    setForm({ name: "", description: "", category: "furniture", sku: "", unitPrice: 0, unit: "piece", lengthCm: 0, widthCm: 0, heightCm: 0, weightKg: 0, isActive: true, isCatalog: false });
    setEditing(null);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || "", category: p.category, sku: p.sku,
      unitPrice: p.unitPrice, unit: p.unit,
      lengthCm: p.lengthCm || 0, widthCm: p.widthCm || 0, heightCm: p.heightCm || 0, weightKg: p.weightKg || 0,
      isActive: p.isActive, isCatalog: p.isCatalog,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      toast.error("Name and SKU are required");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(editing ? "Product updated!" : "Product created!");
      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const cbm = (p: Product) => {
    if (p.lengthCm && p.widthCm && p.heightCm) return ((p.lengthCm * p.widthCm * p.heightCm) / 1_000_000).toFixed(2);
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products & Services</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="bg-teal hover:bg-teal/90 gap-2">
          <Plus className="h-4 w-4" />Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Product</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">SKU</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Category</th>
                    <th className="pb-3 font-medium text-right">Price</th>
                    <th className="pb-3 font-medium hidden lg:table-cell text-right">CBM</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {p.description && <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell font-mono text-xs">{p.sku}</td>
                      <td className="py-3 hidden md:table-cell"><Badge variant="outline">{p.category}</Badge></td>
                      <td className="py-3 text-right font-medium">${p.unitPrice.toLocaleString()}/{p.unit}</td>
                      <td className="py-3 hidden lg:table-cell text-right">{cbm(p)} m³</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {p.isActive ? <Badge className="bg-emerald-500/10 text-emerald-600" variant="secondary">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                          {p.isCatalog && <Badge className="bg-blue-500/10 text-blue-600" variant="secondary">Catalog</Badge>}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <p className="py-8 text-center text-muted-foreground">No products found. Add your first product!</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
              <div><Label>SKU *</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" rows={2} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit Price ($)</Label><Input type="number" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })} className="mt-1" /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="kg">KG</SelectItem>
                    <SelectItem value="cbm">CBM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div><Label>Length (cm)</Label><Input type="number" value={form.lengthCm} onChange={(e) => setForm({ ...form, lengthCm: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Width (cm)</Label><Input type="number" value={form.widthCm} onChange={(e) => setForm({ ...form, widthCm: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Height (cm)</Label><Input type="number" value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })} className="mt-1" /></div>
              <div><Label>Weight (kg)</Label><Input type="number" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })} className="mt-1" /></div>
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isCatalog} onCheckedChange={(v) => setForm({ ...form, isCatalog: v })} />
                <Label>Show in Catalog</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-teal hover:bg-teal/90">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
