"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Building, Loader2, ShoppingCart, FileText, DollarSign } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  createdAt: string;
  _count: { orders: number; quotes: number; payments: number };
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    setLoading(true);
    fetch(`/api/admin/customers?${params}`)
      .then((r) => r.json())
      .then((data) => setCustomers(data.customers || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers (CRM)</h1>
          <p className="text-muted-foreground">Manage customer relationships</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {customers.length} customers
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Card key={c.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold">{c.name}</p>
                      <Badge variant="outline" className="text-xs">{c.role}</Badge>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      Joined {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{c.email}</p>
                    {c.phone && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{c.phone}</p>}
                    {c.company && <p className="flex items-center gap-2"><Building className="h-3.5 w-3.5" />{c.company}</p>}
                  </div>

                  <div className="flex gap-4 border-t pt-3">
                    <div className="flex items-center gap-1 text-sm">
                      <ShoppingCart className="h-3.5 w-3.5 text-teal" />
                      <span className="font-medium">{c._count.orders}</span>
                      <span className="text-muted-foreground">orders</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      <span className="font-medium">{c._count.quotes}</span>
                      <span className="text-muted-foreground">quotes</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="font-medium">{c._count.payments}</span>
                      <span className="text-muted-foreground">payments</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {customers.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground">No customers found.</div>
          )}
        </div>
      )}
    </div>
  );
}
