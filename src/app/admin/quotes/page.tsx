"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Mail, Phone, Eye, CheckCircle, XCircle } from "lucide-react";

const quotes = [
  { id: "QT-001", name: "Sarah Mitchell", email: "sarah@email.com", phone: "+1-206-555-0101", items: 3, cbm: 4.2, method: "LCL", total: 3850, date: "2026-01-15", status: "pending" },
  { id: "QT-002", name: "James Lee", email: "james@email.com", phone: "+1-206-555-0102", items: 5, cbm: 12.8, method: "FCL 20GP", total: 8200, date: "2026-01-14", status: "pending" },
  { id: "QT-003", name: "Emily Wang", email: "emily@email.com", phone: "+1-206-555-0103", items: 2, cbm: 2.1, method: "LCL", total: 2100, date: "2026-01-13", status: "approved" },
  { id: "QT-004", name: "Michael Chen", email: "michael@email.com", phone: "+1-206-555-0104", items: 7, cbm: 25.0, method: "FCL 40GP", total: 12500, date: "2026-01-12", status: "approved" },
  { id: "QT-005", name: "Lisa Rodriguez", email: "lisa@email.com", phone: "+1-206-555-0105", items: 1, cbm: 1.5, method: "LCL", total: 1650, date: "2026-01-11", status: "rejected" },
  { id: "QT-006", name: "David Kim", email: "david@email.com", phone: "+1-206-555-0106", items: 4, cbm: 8.0, method: "LCL", total: 5600, date: "2026-01-10", status: "pending" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600",
  approved: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
};

export default function AdminQuotesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const filtered = quotes.filter((q) => {
    const matchSearch = q.name.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || q.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">Manage customer quote requests</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <FileText className="h-3 w-3" />
          {quotes.filter((q) => q.status === "pending").length} pending
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search quotes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <Button key={s} variant={filter === s ? "default" : "outline"} size="sm" onClick={() => setFilter(s)} className={filter === s ? "bg-teal hover:bg-teal/90" : ""}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Quotes Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Quote ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Contact</th>
                  <th className="pb-3 font-medium">Items / CBM</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Method</th>
                  <th className="pb-3 font-medium text-right">Estimate</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium text-teal">{q.id}</td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{q.name}</p>
                        <p className="text-xs text-muted-foreground">{q.date}</p>
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{q.email}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{q.phone}</span>
                      </div>
                    </td>
                    <td className="py-3">{q.items} items / {q.cbm} CBM</td>
                    <td className="py-3 hidden sm:table-cell">{q.method}</td>
                    <td className="py-3 text-right font-medium">${q.total.toLocaleString()}</td>
                    <td className="py-3">
                      <Badge className={statusColors[q.status]} variant="secondary">{q.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        {q.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600"><CheckCircle className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500"><XCircle className="h-4 w-4" /></Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">No quotes match your filters.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
