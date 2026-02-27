"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Mail, Phone, Building, Loader2,
  ShoppingCart, FileText, DollarSign, Sparkles, Package,
} from "lucide-react";

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
  processing: "bg-blue-500/10 text-blue-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-orange-500/10 text-orange-600",
};

interface CustomerData {
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    role: string;
    createdAt: string;
  };
  quotes: {
    id: string;
    quoteNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    itemCount: number;
  }[];
  orders: {
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    itemCount: number;
    shippingMethod?: string;
    destinationCity?: string;
  }[];
  payments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: string;
  }[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Customer not found");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-teal hover:underline">
          <ArrowLeft className="h-4 w-4" />Back to Customers
        </Link>
        <p className="text-center text-muted-foreground py-12">{error || "Customer not found"}</p>
      </div>
    );
  }

  const { customer, quotes, orders, payments } = data;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Back link + Header */}
      <div>
        <Link href="/admin/customers" className="flex items-center gap-1 text-sm text-teal hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" />Back to Customers
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              {customer.role === "lead" ? (
                <Badge className="bg-amber-500/10 text-amber-600 gap-1" variant="secondary"><Sparkles className="h-3 w-3" />Quote Lead</Badge>
              ) : customer.role === "admin" ? (
                <Badge className="bg-teal/10 text-teal" variant="secondary">Admin</Badge>
              ) : (
                <Badge variant="outline">Customer</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Since {new Date(customer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info + Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Contact</p>
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{customer.email}</p>
              {customer.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{customer.phone}</p>}
              {customer.company && <p className="flex items-center gap-2"><Building className="h-3.5 w-3.5 text-muted-foreground" />{customer.company}</p>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-500/10 p-2"><FileText className="h-4 w-4 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{quotes.length}</p>
                <p className="text-xs text-muted-foreground">Quotes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-purple-500/10 p-2"><Package className="h-4 w-4 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2"><DollarSign className="h-4 w-4 text-emerald-600" /></div>
              <div>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-teal" />Quotes / POs ({quotes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {quotes.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No quotes yet</p>
          ) : (
            <div className="space-y-2">
              {quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-teal">{q.quoteNumber}</p>
                    <p className="text-xs text-muted-foreground">{q.itemCount} item{q.itemCount !== 1 ? "s" : ""} · {new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-medium">${q.totalAmount.toLocaleString()}</p>
                    <Badge className={statusColors[q.status] || ""} variant="secondary">{q.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-teal" />Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium text-teal">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.itemCount} item{o.itemCount !== 1 ? "s" : ""}
                      {o.shippingMethod && ` · ${o.shippingMethod}`}
                      {o.destinationCity && ` → ${o.destinationCity}`}
                      {" · "}{new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-medium">${o.totalAmount.toLocaleString()}</p>
                    <Badge className={statusColors[o.status] || ""} variant="secondary">{o.status.replace(/_/g, " ")}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payments Table */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-teal" />Payments ({payments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">{p.method.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="font-medium">${p.amount.toLocaleString()} {p.currency}</p>
                    <Badge className={statusColors[p.status] || ""} variant="secondary">{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
