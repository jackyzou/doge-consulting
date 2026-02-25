"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building, Shield, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/airwallex";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

interface OrderData {
  orderId: string;
  items: string[];
  subtotal: number;
  shipping: number;
  insurance: number;
  total: number;
  deposit: number;
  balance: number;
}

function generateOrderId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `ORD-${y}-${seq}`;
}

function PaymentContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [processing, setProcessing] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // Build order from URL params (coming from quote page) or use demo defaults
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const totalParam = searchParams.get("total");
    const itemsParam = searchParams.get("items");
    const nameParam = searchParams.get("name");
    const emailParam = searchParams.get("email");

    if (totalParam) {
      // Real data from quote page
      const total = parseFloat(totalParam);
      const items = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : ["Shipping Services"];
      const deposit = Math.round(total * 0.7 * 100) / 100;
      const balance = Math.round((total - deposit) * 100) / 100;

      setOrder({
        orderId: generateOrderId(),
        items,
        subtotal: total,
        shipping: 0,
        insurance: 0,
        total,
        deposit,
        balance,
      });
      if (nameParam) setCustomerName(nameParam);
      if (emailParam) setCustomerEmail(emailParam);
    } else {
      // Demo order for direct visits
      setOrder({
        orderId: generateOrderId(),
        items: ["Marble Dining Table", "6x Dining Chairs", "TV Console"],
        subtotal: 8500,
        shipping: 3200,
        insurance: 170,
        total: 11870,
        deposit: 8309,
        balance: 3561,
      });
    }
  }, [searchParams]);

  const handlePayment = useCallback(async () => {
    if (!order) return;

    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error(t("paymentPage.fillRequired"));
      return;
    }

    if (paymentMethod === "bank") {
      toast.success(t("paymentPage.bankSubmitted"));
      return;
    }

    setProcessing(true);

    try {
      const res = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: order.deposit,
          currency: "USD",
          orderId: order.orderId,
          customerEmail: customerEmail.trim(),
          customerName: customerName.trim(),
          description: `Doge Consulting – Deposit for ${order.orderId}`,
          items: order.items,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Payment failed");
      }

      const data = await res.json();

      if (data.checkoutUrl) {
        // Redirect to Airwallex checkout (or demo success page)
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast.error(t("paymentPage.paymentError"));
      setProcessing(false);
    }
  }, [order, customerName, customerEmail, paymentMethod, t]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal/30 border-t-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">{t("paymentPage.badge")}</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">{t("paymentPage.title")}</h1>
            <p className="mt-3 text-slate-300 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" /> {t("paymentPage.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-5">
            {/* Payment Form */}
            <div className="md:col-span-3 space-y-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>

                {/* Customer Info */}
                <Card>
                  <CardHeader><CardTitle className="text-lg">{t("paymentPage.customerTitle")}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="pay-name">{t("paymentPage.yourName")}</Label>
                      <Input
                        id="pay-name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={t("paymentPage.yourNamePlaceholder")}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pay-email">{t("paymentPage.yourEmail")}</Label>
                      <Input
                        id="pay-email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder={t("paymentPage.yourEmailPlaceholder")}
                        required
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card className="mt-6">
                  <CardHeader><CardTitle className="text-lg">{t("paymentPage.methodTitle")}</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "bank")} className="space-y-3">
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === "card" ? "border-teal bg-teal/5" : "border-border/50"}`}>
                        <RadioGroupItem value="card" />
                        <CreditCard className="h-5 w-5 text-teal" />
                        <div className="flex-1">
                          <p className="font-medium">{t("paymentPage.cardTitle")}</p>
                          <p className="text-xs text-muted-foreground">{t("paymentPage.cardDesc")}</p>
                        </div>
                      </label>
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === "bank" ? "border-teal bg-teal/5" : "border-border/50"}`}>
                        <RadioGroupItem value="bank" />
                        <Building className="h-5 w-5 text-teal" />
                        <div className="flex-1">
                          <p className="font-medium">{t("paymentPage.bankTitle")}</p>
                          <p className="text-xs text-muted-foreground">{t("paymentPage.bankDesc")}</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Card: redirect notice */}
                {paymentMethod === "card" && (
                  <Card className="mt-6 border-teal/20 bg-teal/5">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-teal mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{t("paymentPage.redirectTitle")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("paymentPage.redirectDesc")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bank Transfer Instructions */}
                {paymentMethod === "bank" && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="text-lg">{t("paymentPage.bankDetailsTitle")}</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <p className="text-muted-foreground">{t("paymentPage.bankInstructions")}</p>
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.bankName")}</span><span className="font-medium">{t("paymentPage.bankNameValue")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.accountName")}</span><span className="font-medium">{t("paymentPage.accountNameValue")}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.accountNumber")}</span><span className="font-medium font-mono">XXX-XXXXXX-XXX</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.swiftCode")}</span><span className="font-medium font-mono">HSBCHKHHHKH</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.currency")}</span><span className="font-medium">USD</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.reference")}</span><span className="font-medium text-teal">{order.orderId}</span></div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        {t("paymentPage.bankNote")}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={processing}
                  size="lg"
                  className="mt-6 w-full bg-teal text-white hover:bg-teal/90"
                >
                  {processing ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t("paymentPage.processing")}
                    </span>
                  ) : paymentMethod === "card" ? (
                    <>
                      {t("paymentPage.payDeposit").replace("{amount}", formatCurrency(order.deposit))}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      {t("paymentPage.confirmBankTransfer")}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-2">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Card className="sticky top-24">
                  <CardHeader><CardTitle className="text-lg">{t("paymentPage.orderSummaryTitle")}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-xs font-mono text-muted-foreground">{order.orderId}</div>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <span className="h-2 w-2 rounded-full bg-teal" />
                          {item}
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      {order.subtotal > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.products")}</span><span>{formatCurrency(order.subtotal)}</span></div>
                      )}
                      {order.shipping > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.shipping")}</span><span>{formatCurrency(order.shipping)}</span></div>
                      )}
                      {order.insurance > 0 && (
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.insurance")}</span><span>{formatCurrency(order.insurance)}</span></div>
                      )}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>{t("paymentPage.total")}</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <div className="rounded-lg bg-teal/5 p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-teal">{t("paymentPage.deposit")}</span>
                        <span className="font-bold text-teal">{formatCurrency(order.deposit)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{t("paymentPage.balanceDue")}</span>
                        <span>{formatCurrency(order.balance)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" /> {t("paymentPage.poweredBy")}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
