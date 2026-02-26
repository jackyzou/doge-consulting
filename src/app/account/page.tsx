"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Package, Truck, FileDown, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Stats {
  quotes: number;
  orders: number;
  activeShipments: number;
  documents: number;
}

export default function AccountDashboard() {
  const [stats, setStats] = useState<Stats>({ quotes: 0, orders: 0, activeShipments: 0, documents: 0 });
  const [recentQuotes, setRecentQuotes] = useState<{ quoteNumber: string; status: string; totalAmount: number; createdAt: string }[]>([]);
  const [recentOrders, setRecentOrders] = useState<{ orderNumber: string; status: string; totalAmount: number; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/customer/quotes").then((r) => r.json()),
      fetch("/api/customer/orders").then((r) => r.json()),
      fetch("/api/customer/documents").then((r) => r.json()),
    ])
      .then(([qData, oData, dData]) => {
        const quotes = qData.quotes || [];
        const orders = oData.orders || [];
        const docs = dData.documents || [];
        setStats({
          quotes: quotes.length,
          orders: orders.length,
          activeShipments: orders.filter((o: { status: string }) => !["delivered", "closed", "cancelled"].includes(o.status)).length,
          documents: docs.length,
        });
        setRecentQuotes(quotes.slice(0, 3));
        setRecentOrders(orders.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColors: Record<string, string> = {
    draft: "bg-gray-500/10 text-gray-600",
    sent: "bg-blue-500/10 text-blue-600",
    accepted: "bg-emerald-500/10 text-emerald-600",
    rejected: "bg-red-500/10 text-red-600",
    converted: "bg-teal-500/10 text-teal-600",
    pending: "bg-amber-500/10 text-amber-600",
    confirmed: "bg-blue-500/10 text-blue-600",
    sourcing: "bg-amber-500/10 text-amber-600",
    packing: "bg-indigo-500/10 text-indigo-600",
    in_transit: "bg-purple-500/10 text-purple-600",
    customs: "bg-orange-500/10 text-orange-600",
    delivered: "bg-emerald-500/10 text-emerald-600",
    closed: "bg-gray-500/10 text-gray-600",
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your account overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/account/quotes">
          <Card className="hover:border-teal/30 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.quotes}</p>
                <p className="text-sm text-muted-foreground">Quotes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/orders">
          <Card className="hover:border-teal/30 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal/10">
                <Package className="h-6 w-6 text-teal" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.orders}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/tracking">
          <Card className="hover:border-teal/30 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
                <Truck className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeShipments}</p>
                <p className="text-sm text-muted-foreground">Active Shipments</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/account/documents">
          <Card className="hover:border-teal/30 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <FileDown className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.documents}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Quotes</CardTitle>
            <Link href="/account/quotes" className="text-sm text-teal hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentQuotes.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No quotes yet. <Link href="/quote" className="text-teal hover:underline">Get a free quote</Link></p>
            ) : (
              <div className="space-y-3">
                {recentQuotes.map((q) => (
                  <div key={q.quoteNumber} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{q.quoteNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">${q.totalAmount.toLocaleString()}</span>
                      <Badge className={statusColors[q.status] || ""} variant="secondary">{q.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <Link href="/account/orders" className="text-sm text-teal hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.orderNumber} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">${o.totalAmount.toLocaleString()}</span>
                      <Badge className={statusColors[o.status] || ""} variant="secondary">{o.status.replace(/_/g, " ")}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
