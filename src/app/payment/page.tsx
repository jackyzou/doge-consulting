"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Building, Shield, Lock, Check, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/airwallex";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";

export default function PaymentPage() {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Demo order data
  const order = {
    id: "ORD-2026-001",
    items: ["Marble Dining Table", "6x Dining Chairs", "TV Console"],
    subtotal: 8500,
    shipping: 3200,
    insurance: 170,
    total: 11870,
    deposit: 8309, // 70%
    balance: 3561, // 30%
  };

  const handlePayment = async () => {
    setProcessing(true);

    // Simulate Airwallex payment processing
    await new Promise((r) => setTimeout(r, 2000));

    setProcessing(false);
    setSuccess(true);
    toast.success("Payment successful! You'll receive a confirmation email shortly.");
  };

  if (success) {
    return (
      <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal/10">
            <Check className="h-10 w-10 text-teal" />
          </div>
          <h1 className="text-3xl font-bold">{t("paymentPage.successTitle")}</h1>
          <p className="text-muted-foreground">
            {t("paymentPage.successMsg").replace("{amount}", formatCurrency(order.deposit)).replace("{orderId}", order.id)}
          </p>
          <Card className="text-left">
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span>Order ID</span><span className="font-medium">{order.id}</span></div>
              <div className="flex justify-between"><span>{t("paymentPage.amountPaid")}</span><span className="font-medium text-teal">{formatCurrency(order.deposit)}</span></div>
              <div className="flex justify-between"><span>{t("paymentPage.balanceDueLabel")}</span><span className="font-medium">{formatCurrency(order.balance)}</span></div>
              <div className="flex justify-between"><span>{t("paymentPage.paymentMethod")}</span><span className="font-medium">{paymentMethod === "card" ? t("paymentPage.creditCard") : t("paymentPage.bankTransfer")}</span></div>
              <div className="flex justify-between"><span>{t("paymentPage.processedVia")}</span><span className="font-medium">Airwallex</span></div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">{t("paymentPage.confirmationNote")}</p>
        </motion.div>
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
                {/* Payment Method Selection */}
                <Card>
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

                {/* Card Form */}
                {paymentMethod === "card" && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="text-lg">{t("paymentPage.cardDetailsTitle")}</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>{t("paymentPage.cardNumber")}</Label>
                        <Input placeholder={t("paymentPage.cardNumberPlaceholder")} className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>{t("paymentPage.expiry")}</Label><Input placeholder={t("paymentPage.expiryPlaceholder")} className="mt-1" /></div>
                        <div><Label>{t("paymentPage.cvc")}</Label><Input placeholder={t("paymentPage.cvcPlaceholder")} className="mt-1" /></div>
                      </div>
                      <div>
                        <Label>{t("paymentPage.cardholderName")}</Label>
                        <Input placeholder={t("paymentPage.cardholderPlaceholder")} className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 text-teal" />
                        {t("paymentPage.secureNote")}
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
                        <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.reference")}</span><span className="font-medium text-teal">{order.id}</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("paymentPage.bankNote")}
                      </p>
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
                  ) : (
                    <>
                      {t("paymentPage.payDeposit").replace("{amount}", formatCurrency(order.deposit))}
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
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.products")}</span><span>{formatCurrency(order.subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.shipping")}</span><span>{formatCurrency(order.shipping)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("paymentPage.insurance")}</span><span>{formatCurrency(order.insurance)}</span></div>
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
