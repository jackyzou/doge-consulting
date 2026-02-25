"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, MessageSquare } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import Link from "next/link";

function PaymentCancelContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md w-full"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
          <XCircle className="h-10 w-10 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold">{t("paymentCancel.title")}</h1>
        <p className="text-muted-foreground">{t("paymentCancel.subtitle")}</p>

        {orderId && (
          <Card className="text-left">
            <CardContent className="pt-6 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("paymentCancel.orderId")}</span>
                <span className="font-mono font-medium">{orderId}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/payment" className="flex-1">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("paymentCancel.retryBtn")}
            </Button>
          </Link>
          <Link href="/contact" className="flex-1">
            <Button className="w-full bg-teal text-white hover:bg-teal/90">
              <MessageSquare className="mr-2 h-4 w-4" />
              {t("paymentCancel.contactBtn")}
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-teal/30 border-t-teal" /></div>}>
      <PaymentCancelContent />
    </Suspense>
  );
}
