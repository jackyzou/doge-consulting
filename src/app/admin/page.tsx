"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, FileText, TrendingUp, ArrowUpRight, Clock, Ship } from "lucide-react";

const stats = [
  { title: "Total Revenue", value: "$128,400", change: "+12.5%", icon: DollarSign, trend: "up" as const },
  { title: "Active Orders", value: "24", change: "+3 this week", icon: Package, trend: "up" as const },
  { title: "Pending Quotes", value: "8", change: "5 new today", icon: FileText, trend: "neutral" as const },
  { title: "CBM Shipped", value: "342", change: "+18% MoM", icon: TrendingUp, trend: "up" as const },
];

const recentOrders = [
  { id: "DC-2026-001", customer: "Sarah M.", items: "Dining Set, Console", status: "in_transit", amount: 11870, eta: "Feb 15, 2026" },
  { id: "DC-2026-002", customer: "James L.", items: "Sofa, Coffee Table", status: "packing", amount: 6250, eta: "Mar 1, 2026" },
  { id: "DC-2026-003", customer: "Emily W.", items: "Bed Frame, Wardrobe", status: "sourcing", amount: 9400, eta: "Mar 20, 2026" },
  { id: "DC-2026-004", customer: "Michael C.", items: "Office Desk, Shelves", status: "delivered", amount: 4800, eta: "Jan 28, 2026" },
  { id: "DC-2026-005", customer: "Lisa R.", items: "Marble Dining Table", status: "customs", amount: 7600, eta: "Feb 8, 2026" },
];

const statusColors: Record<string, string> = {
  sourcing: "bg-amber-500/10 text-amber-600",
  packing: "bg-blue-500/10 text-blue-600",
  in_transit: "bg-purple-500/10 text-purple-600",
  customs: "bg-orange-500/10 text-orange-600",
  delivered: "bg-emerald-500/10 text-emerald-600",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your shipping operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="rounded-lg bg-teal/10 p-2">
                  <stat.icon className="h-5 w-5 text-teal" />
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-teal" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Items</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium hidden md:table-cell">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium text-teal">{order.id}</td>
                    <td className="py-3">{order.customer}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{order.items}</td>
                    <td className="py-3">
                      <Badge className={statusColors[order.status] || ""} variant="secondary">
                        {order.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium">${order.amount.toLocaleString()}</td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{order.eta}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-teal/10 p-2"><FileText className="h-5 w-5 text-teal" /></div>
            <div><p className="font-medium">View Quotes</p><p className="text-xs text-muted-foreground">8 pending review</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-amber-500/10 p-2"><Package className="h-5 w-5 text-amber-600" /></div>
            <div><p className="font-medium">Manage Orders</p><p className="text-xs text-muted-foreground">24 active shipments</p></div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-teal/50 transition-colors">
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="rounded-lg bg-purple-500/10 p-2"><TrendingUp className="h-5 w-5 text-purple-600" /></div>
            <div><p className="font-medium">Analytics</p><p className="text-xs text-muted-foreground">View detailed reports</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
