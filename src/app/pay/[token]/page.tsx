"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DogeLogo } from "@/components/ui/doge-logo";
import {
  Loader2, CreditCard, CheckCircle2, XCircle, Shield, Lock, Tag, X,
} from "lucide-react";
import { Input } from "@/components/ui/input";

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

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    couponId: string; code: string; discountAmount: number; description?: string;
  } | null>(null);

  const effectiveAmount = appliedCoupon
    ? Math.round(((data?.amount || 0) - appliedCoupon.discountAmount) * 100) / 100
    : Math.round((data?.amount || 0) * 100) / 100;

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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: data?.amount || 0,
          email: data?.quote?.customerEmail || "",
        }),
      });
      const result = await res.json();
      if (result.valid) {
        setAppliedCoupon({
          couponId: result.couponId,
          code: result.code,
          discountAmount: result.discountAmount,
          description: result.description,
        });
        setCouponError("");
      } else {
        setCouponError(result.error || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Failed to validate coupon");
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

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
          couponId: appliedCoupon?.couponId || null,
          couponCode: appliedCoupon?.code || null,
          discountAmount: appliedCoupon?.discountAmount || 0,
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
              ${effectiveAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm font-normal text-muted-foreground">{data?.currency}</span>
              {appliedCoupon && (
                <span className="text-sm font-normal line-through text-muted-foreground">${data?.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Coupon code input */}
            <div className="space-y-2">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">{appliedCoupon.code} applied!</p>
                      <p className="text-xs text-green-600">-${appliedCoupon.discountAmount.toFixed(2)} discount{appliedCoupon.description ? ` · ${appliedCoupon.description}` : ""}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-7 w-7 p-0 text-green-600 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                      className="pl-9 uppercase"
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}>
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 space-y-2">
              <p className="font-medium">You will be redirected to our secure payment partner</p>
              <p>Airwallex accepts credit cards, debit cards, and other payment methods. Your card details are entered directly on their PCI-compliant checkout page.</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center items-center py-2">
              {/* Visa */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#1A1F71"/><path d="M19.5 21h-3l1.9-11.5h3L19.5 21zm12.8-11.2c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.5.9 1.5 1.4 0 .8-.9 1.1-1.8 1.1-1.2 0-1.8-.2-2.8-.6l-.4-.2-.4 2.4c.7.3 2 .6 3.3.6 3.2 0 5.2-1.5 5.2-3.8 0-1.3-.8-2.2-2.5-3-.6-.5-1.6-1-1.6-1.5 0-.5.5-1 1.6-1 .9 0 1.6.2 2.1.4l.3.1.4-2.1zM37.2 21h2.5l-2.2-11.5H35c-.7 0-1.2.4-1.5 1l-4.2 10.5h3l.6-1.6h3.6l.4 1.6zm-3.1-3.8l1.5-4 .8 4h-2.3zM14 9.5l-2.8 7.8-.3-1.5c-.5-1.7-2.2-3.6-4-4.5l2.5 9.7h3l4.6-11.5H14z" fill="#fff"/><path d="M9.2 9.5H4.6l-.1.3c3.6.9 5.9 3 6.9 5.5L10.5 11c-.2-.7-.7-1-1.3-1z" fill="#F7A600"/></svg>
              {/* Mastercard */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#252525"/><circle cx="19" cy="16" r="8" fill="#EB001B"/><circle cx="29" cy="16" r="8" fill="#F79E1B"/><path d="M24 9.8a8 8 0 010 12.4 8 8 0 000-12.4z" fill="#FF5F00"/></svg>
              {/* Amex */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#2E77BC"/><path d="M6 16.5l1.5-3.5h2l.8 2 .9-2h2L11.5 17l1.6 3.5h-2l-.9-2-.8 2h-2L8.9 17 6 16.5zm12-3.5h5.5l1 1.2 1-1.2H31l-2.5 3.5L31 20h-5.5l-1-1.2-1 1.2H18l2.5-3.5L18 13zm2.5 2v1h3.2l-1.2-1H20.5zm0 3v1h3.2l-1.2-1H20.5zM33 13h2.5l2.5 3.5L35.5 20H33l2.5-3.5L33 13z" fill="#fff"/></svg>
              {/* UnionPay */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb"/><rect x="6" y="6" width="12" height="20" rx="2" fill="#E21836"/><rect x="18" y="6" width="12" height="20" rx="2" fill="#00447C"/><rect x="30" y="6" width="12" height="20" rx="2" fill="#007B84"/><text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="bold" fontFamily="Arial">UP</text></svg>
              {/* Apple Pay */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#000"/><text x="24" y="19" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="Arial" fontWeight="600"> Pay</text><path d="M16.5 10.5c.6-.8 1-1.8.9-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-.9 2.7.9.1 1.9-.5 2.7-1.3z" fill="#fff"/><path d="M17.4 13.2c-1.5-.1-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.7 1.1 8.9.8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1 2.8-2.1.5-.8.9-1.6 1.1-2.5-2.7-1-3.1-4.8-.4-6.2-.9-1-2.1-1.6-3.3-1.6z" fill="#fff" transform="translate(4,-2) scale(.7)"/></svg>
              {/* Google Pay */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb"/><text x="29" y="19" textAnchor="middle" fill="#5F6368" fontSize="8" fontFamily="Arial" fontWeight="500">Pay</text><path d="M14.3 16.7v3.1h-1V12h2.6c.6 0 1.2.2 1.7.6.5.4.7.9.7 1.6 0 .6-.2 1.2-.7 1.6-.5.4-1 .6-1.7.6h-1.6zm0-3.8v2.9h1.7c.4 0 .8-.2 1.1-.5.3-.3.4-.6.4-1 0-.4-.1-.7-.4-1a1.4 1.4 0 00-1.1-.4h-1.7z" fill="#5F6368"/><circle cx="10" cy="16" r="3.5" fill="#4285F4"/><path d="M10 13.5v1.7h2.4c-.1.7-.4 1.2-.8 1.6-.5.4-1 .7-1.6.7a2.8 2.8 0 010-5.6c.7 0 1.3.3 1.8.7l1.2-1.2c-.8-.7-1.8-1.1-3-1.1a4.3 4.3 0 000 8.6c1.2 0 2.2-.4 3-1.2.8-.8 1-1.8 1-3 0-.3 0-.6-.1-.8H10z" fill="#4285F4"/></svg>
              {/* PayPal */}
              <svg viewBox="0 0 48 32" className="h-8 w-12" fill="none"><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb"/><path d="M19.2 8h5.7c1.9 0 3.4 1.4 3.2 3.3-.3 2.4-2.2 4.2-4.6 4.2H21l-.7 4.5h-2.7l1.6-12z" fill="#003087"/><path d="M22.2 8h5.7c1.9 0 3.4 1.4 3.2 3.3-.3 2.4-2.2 4.2-4.6 4.2H24l-.7 4.5h-2.7l1.6-12z" fill="#009CDE"/><path d="M15 24l.8-5h2.7l-.8 5H15z" fill="#003087"/><path d="M18 24l.8-5h2.7l-.8 5H18z" fill="#009CDE"/></svg>
            </div>

            <Button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-teal hover:bg-teal/90 gap-2 h-12 text-base"
            >
              {processing ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Redirecting to Airwallex…</>
              ) : (
                <><Lock className="h-5 w-5" />Pay ${effectiveAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
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
