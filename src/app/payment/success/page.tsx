"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Package, ArrowRight, Copy } from "lucide-react";
import { formatCurrency } from "@/lib/airwallex";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  const orderId = searchParams.get("orderId") || "N/A";
  const amount = parseFloat(searchParams.get("amount") || "0");
  const currency = searchParams.get("currency") || "USD";
  const isDemo = searchParams.get("demo") === "1";

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success(t("paymentSuccess.copied"));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-lg w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-teal/10 border-2 border-teal/30"
        >
          <Check className="h-12 w-12 text-teal" strokeWidth={3} />
        </motion.div>

        <h1 className="text-3xl font-bold">{t("paymentSuccess.title")}</h1>
        <p className="text-muted-foreground">
          {t("paymentSuccess.subtitle")}
        </p>

        {/* Payment Details Card */}
        <Card className="text-left">
          <CardContent className="pt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{t("paymentSuccess.orderId")}</span>
              <button onClick={copyOrderId} className="flex items-center gap-1.5 font-mono font-medium text-sm hover:text-teal transition-colors">
                {orderId}
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            {amount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t("paymentSuccess.amountPaid")}</span>
                <span className="font-semibold text-teal">{formatCurrency(amount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("paymentSuccess.status")}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-teal">
                <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                {t("paymentSuccess.confirmed")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">{t("paymentSuccess.processedBy")}</span>
              <span className="text-sm font-medium">Airwallex{isDemo ? " (Demo)" : ""}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="text-left border-teal/20 bg-teal/5">
          <CardContent className="pt-6 space-y-3">
            <p className="font-semibold text-sm">{t("paymentSuccess.nextSteps")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account/orders" className="flex items-start gap-2 text-muted-foreground hover:text-teal transition-colors group">
                  <Check className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  <span className="group-hover:underline">{t("paymentSuccess.step1")}</span>
                </Link>
              </li>
              <li>
                <Link href="/account/tracking" className="flex items-start gap-2 text-muted-foreground hover:text-teal transition-colors group">
                  <Package className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  <span className="group-hover:underline">{t("paymentSuccess.step2")}</span>
                </Link>
              </li>
              <li>
                <Link href="/track" className="flex items-start gap-2 text-muted-foreground hover:text-teal transition-colors group">
                  <ArrowRight className="h-4 w-4 text-teal mt-0.5 shrink-0" />
                  <span className="group-hover:underline">{t("paymentSuccess.step3")}</span>
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/account/orders" className="flex-1">
            <Button className="w-full bg-teal text-white hover:bg-teal/90">
              <Package className="mr-2 h-4 w-4" />
              View My Orders
            </Button>
          </Link>
          <Link href="/account/tracking" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("paymentSuccess.trackBtn")}
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="ghost" className="w-full">
              {t("paymentSuccess.homeBtn")}
            </Button>
          </Link>
        </div>

        {isDemo && (
          <p className="text-xs text-amber-500 bg-amber-500/10 rounded-lg p-3">
            ⚠️ This is a demo payment. No real charge was made. Configure Airwallex API keys to enable live payments.
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal/30 border-t-teal" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}