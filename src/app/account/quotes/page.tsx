"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Loader2, Eye, CreditCard } from "lucide-react";
import Link from "next/link";

interface QuoteItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  customerName: string;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  shippingMethod?: string;
  destinationCity: string;
  estimatedTransit?: string;
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
  paymentLink?: { token: string; status: string; amount: number } | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-500/10 text-gray-600",
  sent: "bg-blue-500/10 text-blue-600",
  accepted: "bg-emerald-500/10 text-emerald-600",
  rejected: "bg-red-500/10 text-red-600",
  expired: "bg-amber-500/10 text-amber-600",
  converted: "bg-teal-500/10 text-teal-600",
};

export default function CustomerQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetail, setShowDetail] = useState<Quote | null>(null);

  useEffect(() => {
    fetch("/api/customer/quotes")
      .then((r) => r.json())
      .then((data) => setQuotes(data.quotes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Quotes</h1>
        <p className="text-muted-foreground">View all your quote requests and proposals</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-teal" /></div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No quotes yet</h3>
            <p className="text-muted-foreground mb-4">Get started by requesting a free shipping quote.</p>
            <Link href="/quote"><Button className="bg-teal hover:bg-teal/90">Get Free Quote</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quotes.map((q) => (
            <Card key={q.id} className="hover:border-teal/30 transition-colors">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-teal">{q.quoteNumber}</span>
                      <Badge className={statusColors[q.status] || ""} variant="secondary">{q.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {q.items.length} item{q.items.length !== 1 ? "s" : ""} · {q.shippingMethod || "N/A"} · {q.destinationCity}
                    </p>
                    <p className="text-xs text-muted-foreground">Submitted {new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">${q.totalAmount.toLocaleString()}</span>
                    <Button variant="outline" size="sm" onClick={() => setShowDetail(q)} className="gap-1">
                      <Eye className="h-3 w-3" />View
                    </Button>
                    {q.paymentLink && q.paymentLink.status === "active" && (
                      <Link href={`/pay/${q.paymentLink.token}`}>
                        <Button size="sm" className="bg-teal hover:bg-teal/90 gap-1">
                          <CreditCard className="h-3 w-3" />Pay Deposit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {showDetail && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal" />
                  {showDetail.quoteNumber}
                  <Badge className={statusColors[showDetail.status] || ""} variant="secondary">{showDetail.status}</Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Shipping:</span> <span className="font-medium">{showDetail.shippingMethod || "N/A"}</span></div>
                  <div><span className="text-muted-foreground">Destination:</span> <span className="font-medium">{showDetail.destinationCity}</span></div>
                  {showDetail.estimatedTransit && <div><span className="text-muted-foreground">Transit:</span> <span className="font-medium">{showDetail.estimatedTransit}</span></div>}
                  <div><span className="text-muted-foreground">Submitted:</span> <span className="font-medium">{new Date(showDetail.createdAt).toLocaleDateString()}</span></div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-right">Qty</th>
                        <th className="px-3 py-2 text-right">Price</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {showDetail.items.map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2">{it.name}</td>
                          <td className="px-3 py-2 text-right">{it.quantity}</td>
                          <td className="px-3 py-2 text-right">${it.unitPrice.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-medium">${it.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-sm space-y-1 text-right">
                  <p>Subtotal: ${showDetail.subtotal.toLocaleString()}</p>
                  {showDetail.shippingCost > 0 && <p>Shipping: ${showDetail.shippingCost.toLocaleString()}</p>}
                  <p className="text-lg font-bold">Total: ${showDetail.totalAmount.toLocaleString()}</p>
                </div>

                {showDetail.notes && <p className="text-sm text-muted-foreground border-t pt-2">{showDetail.notes}</p>}

                {showDetail.paymentLink && showDetail.paymentLink.status === "active" && (
                  <div className="border-t pt-4">
                    <Link href={`/pay/${showDetail.paymentLink.token}`}>
                      <Button className="w-full bg-teal hover:bg-teal/90 gap-2">
                        <CreditCard className="h-4 w-4" />Pay Deposit (${showDetail.paymentLink.amount.toLocaleString()})
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
