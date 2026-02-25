"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileDown, Search, Loader2, FileText, Receipt, ClipboardList } from "lucide-react";

interface Doc {
  id: string;
  documentNumber: string;
  type: string;
  orderId: string;
  order?: { orderNumber: string; customerName: string };
  issuedAt: string;
  createdAt: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  invoice: <FileText className="h-5 w-5 text-blue-500" />,
  receipt: <Receipt className="h-5 w-5 text-emerald-500" />,
  purchase_order: <ClipboardList className="h-5 w-5 text-purple-500" />,
  proforma: <FileDown className="h-5 w-5 text-amber-500" />,
};

const typeColors: Record<string, string> = {
  invoice: "bg-blue-500/10 text-blue-600",
  receipt: "bg-emerald-500/10 text-emerald-600",
  purchase_order: "bg-purple-500/10 text-purple-600",
  proforma: "bg-amber-500/10 text-amber-600",
};

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/documents")
      .then((r) => r.json())
      .then((data) => setDocs(data.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) =>
    d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.order?.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    d.order?.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Generated invoices, receipts, and purchase orders</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <FileDown className="h-3 w-3" />
          {docs.length} documents
        </Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Document #</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Order</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Customer</th>
                    <th className="pb-3 font-medium">Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {typeIcons[d.type] || <FileText className="h-5 w-5" />}
                          <span className="font-medium">{d.documentNumber}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge className={typeColors[d.type] || ""} variant="secondary">
                          {d.type.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 text-teal font-medium">{d.order?.orderNumber || "—"}</td>
                      <td className="py-3 hidden sm:table-cell">{d.order?.customerName || "—"}</td>
                      <td className="py-3 text-muted-foreground">{new Date(d.issuedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">
                  No documents yet. Generate invoices from the Orders page.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
