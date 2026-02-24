"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, MapPin, Calendar, DollarSign, Eye, Edit } from "lucide-react";

const orders = [
  { id: "DC-2026-001", customer: "Sarah M.", items: ["Marble Dining Table", "6x Chairs", "TV Console"], status: "in_transit", amount: 11870, paid: 8309, method: "FCL 20GP", origin: "Foshan", location: "Pacific Ocean", eta: "Feb 15, 2026", created: "2026-01-05" },
  { id: "DC-2026-002", customer: "James L.", items: ["Sectional Sofa", "Coffee Table"], status: "packed_foshan", amount: 6250, paid: 4375, method: "LCL", origin: "Foshan", location: "Foshan Warehouse", eta: "Mar 1, 2026", created: "2026-01-10" },
  { id: "DC-2026-003", customer: "Emily W.", items: ["King Bed Frame", "Wardrobe", "Nightstands"], status: "sourcing", amount: 9400, paid: 6580, method: "FCL 20GP", origin: "Foshan", location: "Foshan Market", eta: "Mar 20, 2026", created: "2026-01-12" },
  { id: "DC-2026-004", customer: "Michael C.", items: ["Standing Desk", "Bookshelf"], status: "delivered", amount: 4800, paid: 4800, method: "LCL", origin: "Shenzhen", location: "Seattle, WA", eta: "Jan 28, 2026", created: "2025-12-15" },
  { id: "DC-2026-005", customer: "Lisa R.", items: ["Marble Dining Table"], status: "customs_clearance", amount: 7600, paid: 5320, method: "LCL", origin: "Foshan", location: "Seattle Port", eta: "Feb 8, 2026", created: "2025-12-20" },
  { id: "DC-2026-006", customer: "David K.", items: ["Sofa", "Console", "Rug"], status: "hk_warehouse", amount: 5800, paid: 4060, method: "LCL", origin: "Foshan", location: "HK Warehouse", eta: "Feb 25, 2026", created: "2026-01-08" },
];

const allStatuses = ["sourcing", "packed_foshan", "hk_warehouse", "in_transit", "customs_clearance", "delivered"];
const statusColors: Record<string, string> = {
  sourcing: "bg-amber-500/10 text-amber-600",
  packed_foshan: "bg-blue-500/10 text-blue-600",
  hk_warehouse: "bg-indigo-500/10 text-indigo-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  customs_clearance: "bg-orange-500/10 text-orange-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
};
const statusLabels: Record<string, string> = {
  sourcing: "Sourcing",
  packed_foshan: "Packed (Foshan)",
  hk_warehouse: "HK Warehouse",
  in_transit: "In Transit",
  customs_clearance: "Customs",
  delivered: "Delivered",
};

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = orders.filter((o) => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders & Shipments</h1>
          <p className="text-muted-foreground">Track and manage all orders</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Package className="h-3 w-3" />
          {orders.filter((o) => o.status !== "delivered").length} active
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {filtered.map((order) => (
          <Card key={order.id} className="hover:border-teal/30 transition-colors">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-lg font-bold text-teal">{order.id}</span>
                    <Badge className={statusColors[order.status]} variant="secondary">
                      {statusLabels[order.status]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">· {order.customer}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{order.location}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />ETA: {order.eta}</span>
                    <span className="flex items-center gap-1"><Package className="h-3 w-3" />{order.method}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                  <div className="text-right">
                    <p className="text-lg font-bold">${order.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <DollarSign className="h-3 w-3" />
                      Paid: ${order.paid.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="gap-1"><Eye className="h-3 w-3" />View</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Edit className="h-3 w-3" />Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-muted-foreground">No orders match your filters.</p>
      )}
    </div>
  );
}
