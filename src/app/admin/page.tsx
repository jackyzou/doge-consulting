"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign, Package, FileText, TrendingUp, ArrowUpRight,
  Ship, Loader2, Users, ShoppingCart, ClipboardList,
} from "lucide-react";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  totalQuotes: number;
  pendingQuotes: number;
  totalCustomers: number;
  totalProducts: number;
  ordersByStatus: Record<string, number>;
  quotesByStatus: Record<string, number>;
  monthlyRevenue: { month: string; revenue: number }[];
  recentOrders: { id: string; orderNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }[];
  recentQuotes: { id: string; quoteNumber: string; customerName: string; status: string; totalAmount: number; createdAt: string }[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  sourcing: "bg-amber-500/10 text-amber-600",
  packing: "bg-blue-500/10 text-blue-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  customs: "bg-orange-500/10 text-orange-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
  closed: "bg-gray-500/10 text-gray-600",
  cancelled: "bg-red-500/10 text-red-600",
  draft: "bg-gray-500/10 text-gray-600",
  sent: "bg-blue-500/10 text-blue-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  converted: "bg-teal-500/10 text-teal-600",
  expired: "bg-orange-500/10 text-orange-600",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((raw) => {
        const ordersByStatus: Record<string, number> = {};
        for (const s of raw.orderStatusCounts || []) {
          ordersByStatus[s.status] = s.count;
        }

        const quotesByStatus: Record<string, number> = {};
        for (const s of raw.quoteStatusCounts || []) {
          quotesByStatus[s.status] = s.count;
        }

        const monthlyRevenue: { month: string; revenue: number }[] = Object.entries(
          (raw.monthlyRevenue || {}) as Record<string, number>
        )
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, revenue]) => ({ month, revenue }));

        setData({
          totalRevenue: raw.stats?.totalRevenue ?? 0,
          totalOrders: raw.stats?.totalOrders ?? 0,
          activeOrders: raw.stats?.activeOrders ?? 0,
          totalQuotes: raw.stats?.totalQuotes ?? 0,
          pendingQuotes: raw.stats?.pendingQuotes ?? 0,
          totalCustomers: raw.stats?.totalCustomers ?? 0,
          totalProducts: raw.stats?.totalProducts ?? 0,
          ordersByStatus,
          quotesByStatus,
          monthlyRevenue,
          recentOrders: raw.recentOrders ?? [],
          recentQuotes: raw.recentQuotes ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-teal/10 p-2"><DollarSign className="h-5 w-5 text-teal" /></div>
              <span className="flex items-center gap-1 text-xs text-emerald-600"><ArrowUpRight className="h-3 w-3" />Revenue</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">${data.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">From {data.totalOrders} orders</p>
            </div>
          </CardContent>
        </Card>
        <Link href="/admin/orders">
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-purple-500/10 p-2"><Package className="h-5 w-5 text-purple-600" /></div>
              <span className="flex items-center gap-1 text-xs text-purple-600"><ArrowUpRight className="h-3 w-3" />Active</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{data.activeOrders}</p>
              <p className="text-xs text-muted-foreground">Active Orders</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <Link href="/admin/quotes">
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-amber-500/10 p-2"><FileText className="h-5 w-5 text-amber-600" /></div>
              <span className="flex items-center gap-1 text-xs text-amber-600">{data.totalQuotes} total</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{data.pendingQuotes}</p>
              <p className="text-xs text-muted-foreground">Pending Quotes</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <Link href="/admin/customers">
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-500/10 p-2"><Users className="h-5 w-5 text-blue-600" /></div>
              <span className="flex items-center gap-1 text-xs text-blue-600">{data.totalProducts} products</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{data.totalCustomers}</p>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </div>
          </CardContent>
        </Card>
        </Link>
        <Link href="/admin/orders">
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-emerald-500/10 p-2"><ShoppingCart className="h-5 w-5 text-emerald-600" /></div>
              <span className="flex items-center gap-1 text-xs text-emerald-600">{data.totalProducts} active</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{data.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-teal" />Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {data.monthlyRevenue.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {data.monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">${(m.revenue / 1000).toFixed(1)}k</span>
                  <div className="w-full bg-teal/80 rounded-t-md min-h-[4px] transition-all" style={{ height: `${(m.revenue / maxRevenue) * 160}px` }} />
                  <span className="text-xs text-muted-foreground">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdowns */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-teal" />Orders by Status</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(data.ordersByStatus).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Badge className={statusColors[status] || "bg-gray-100"} variant="secondary">{status.replace(/_/g, " ")}</Badge>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Status Breakdown */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-teal" />Quotes by Status</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(data.quotesByStatus).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No quotes yet</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(data.quotesByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Badge className={statusColors[status] || "bg-gray-100"} variant="secondary">{status.replace(/_/g, " ")}</Badge>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5 text-teal" />Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-sm text-teal hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            {data.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-teal">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.totalAmount.toLocaleString()}</p>
                      <Badge className={statusColors[order.status] || ""} variant="secondary">{order.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotes */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal" />Recent Quotes</CardTitle>
            <Link href="/admin/quotes" className="text-sm text-teal hover:underline">View all →</Link>
          </CardHeader>
          <CardContent>
            {data.recentQuotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No quotes yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentQuotes.map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-teal">{quote.quoteNumber}</p>
                      <p className="text-xs text-muted-foreground">{quote.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${quote.totalAmount.toLocaleString()}</p>
                      <Badge className={statusColors[quote.status] || ""} variant="secondary">{quote.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/quotes">
          <Card className="cursor-pointer hover:border-teal/50 transition-colors">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-teal/10 p-2"><FileText className="h-5 w-5 text-teal" /></div>
              <div><p className="font-medium">Manage Quotes</p><p className="text-xs text-muted-foreground">Create & send quotes</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card className="cursor-pointer hover:border-teal/50 transition-colors">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-amber-500/10 p-2"><ShoppingCart className="h-5 w-5 text-amber-600" /></div>
              <div><p className="font-medium">Product Catalog</p><p className="text-xs text-muted-foreground">Configure products</p></div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/customers">
          <Card className="cursor-pointer hover:border-teal/50 transition-colors">
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="rounded-lg bg-purple-500/10 p-2"><Users className="h-5 w-5 text-purple-600" /></div>
              <div><p className="font-medium">CRM</p><p className="text-xs text-muted-foreground">Customer management</p></div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
