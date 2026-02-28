"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, Building, Loader2, ShoppingCart, FileText, DollarSign, Sparkles, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { generateCsv, downloadCsv } from "@/lib/utils";
import { toast } from "sonner";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("limit", "24");
    setLoading(true);
    fetch(`/api/admin/customers?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { setPage(1); }, [search]);

  const handleExportCsv = () => {
    const csv = generateCsv(customers, [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "company", header: "Company" },
      { key: "role", header: "Type" },
      { key: "_count.orders" as keyof Customer, header: "Orders" },
      { key: "_count.quotes" as keyof Customer, header: "Quotes" },
      { key: "_count.payments" as keyof Customer, header: "Payments" },
      { key: "createdAt", header: "Joined" },
    ]);
    downloadCsv(csv, `customers-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success("CSV exported!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers (CRM)</h1>
          <p className="text-muted-foreground">Manage customer relationships</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-3 w-3" />
          {total} customers
        </Badge>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1" disabled={customers.length === 0}>
          <Download className="h-3 w-3" />Export CSV
        </Button>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : (
        <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <Card key={c.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-bold"><Link href={`/admin/customers/${c.id}`} className="text-teal hover:underline">{c.name}</Link></p>
                      {c.role === "lead" ? (
                        <Badge className="bg-amber-500/10 text-amber-600 text-xs gap-1" variant="secondary"><Sparkles className="h-3 w-3" />Quote Lead</Badge>
                      ) : c.role === "admin" ? (
                        <Badge className="bg-teal/10 text-teal text-xs" variant="secondary">Admin</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Customer</Badge>
                      )}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">Showing {(page - 1) * 24 + 1}–{Math.min(page * 24, total)} of {total}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-sm">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}
