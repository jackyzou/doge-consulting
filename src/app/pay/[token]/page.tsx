"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DogeLogo } from "@/components/ui/doge-logo";
import {
  Loader2, CreditCard, CheckCircle2, XCircle, Shield, Lock,
} from "lucide-react";

interface PaymentLinkData {
  token: string;
  amount: number;
  currency: string;
  description?: string;
  status: string;
  quote?: {
    quoteNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    items: { name: string; quantity: number; unitPrice: number; totalPrice: number }[];
  };
}

export default function PaymentPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/pay/${token}`)
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Invalid payment link");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handlePay = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/pay/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data?.quote?.customerEmail || "",
          name: data?.quote?.customerName || "",
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      if (result.redirectUrl) {
        // Redirect to Airwallex Hosted Payment Page (or demo success)
        window.location.href = result.redirectUrl;
      } else {
        setSuccess(true);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-red-400" />
            <h2 className="text-xl font-bold">Payment Link Invalid</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500" />
            <h2 className="text-xl font-bold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Thank you for your payment of <span className="font-bold text-foreground">${data?.amount.toLocaleString()} {data?.currency}</span>.
              You will receive a confirmation email shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data?.status !== "active") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-amber-400" />
            <h2 className="text-xl font-bold">Payment Link {data?.status === "used" ? "Already Used" : "Expired"}</h2>
            <p className="text-muted-foreground">This payment link is no longer active. Please contact us for a new one.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <DogeLogo size={48} className="mx-auto" />
          <h1 className="text-2xl font-bold">Doge Consulting</h1>
          <p className="text-muted-foreground">Secure Payment Portal</p>
        </div>

        {/* Quote Details */}
        {data?.quote && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote: {data.quote.quoteNumber}</CardTitle>
              <p className="text-sm text-muted-foreground">For {data.quote.customerName}</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.quote.items.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right font-medium">${item.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal" />
              Payment Details
            </CardTitle>
            <div className="flex items-center gap-2 text-2xl font-bold">
              ${data?.amount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{data?.currency}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 space-y-2">
              <p className="font-medium">You will be redirected to our secure payment partner</p>
              <p>Airwallex accepts credit cards, debit cards, and other payment methods. Your card details are entered directly on their PCI-compliant checkout page.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="text-xs">Visa</Badge>
              <Badge variant="outline" className="text-xs">Mastercard</Badge>
              <Badge variant="outline" className="text-xs">Amex</Badge>
              <Badge variant="outline" className="text-xs">UnionPay</Badge>
            </div>

            <Button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-teal hover:bg-teal/90 gap-2 h-12 text-base"
            >
              {processing ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Redirecting to Airwallex…</>
              ) : (
                <><Lock className="h-5 w-5" />Pay ${data?.amount.toLocaleString()}</>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Secured by Airwallex · 256-bit SSL encryption</span>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Doge Consulting Group Limited
        </p>
      </div>
    </div>
  );
}
