"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileDown, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Document {
  id: string;
  documentNumber: string;
  type: string;
  issuedAt: string;
  createdAt: string;
  order: { orderNumber: string; customerName: string };
}

const typeLabels: Record<string, string> = {
  invoice: "Invoice",
  receipt: "Receipt",
  purchase_order: "Purchase Order",
  proforma: "Proforma Invoice",
};

const typeColors: Record<string, string> = {
  invoice: "bg-blue-500/10 text-blue-600",
  receipt: "bg-emerald-500/10 text-emerald-600",
  purchase_order: "bg-purple-500/10 text-purple-600",
  proforma: "bg-amber-500/10 text-amber-600",
};

export default function CustomerDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/documents")
      .then((r) => r.json())
      .then((data) => setDocuments(data.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (doc: Document) => {
    try {
      // For now, show the document info (PDF generation would require server-side)
      toast.info(`Document ${doc.documentNumber} — PDF download coming soon`);
    } catch {
      toast.error("Failed to download document");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground">View and download your invoices, receipts, and purchase orders</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>
            <p className="text-muted-foreground">Your invoices, receipts, and POs will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{doc.documentNumber}</span>
                      <Badge className={typeColors[doc.type] || ""} variant="secondary">
                        {typeLabels[doc.type] || doc.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Order: {doc.order.orderNumber} · Issued {new Date(doc.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(doc)} className="gap-1">
                    <FileDown className="h-3 w-3" />Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
