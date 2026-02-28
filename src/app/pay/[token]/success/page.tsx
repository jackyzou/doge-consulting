"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DogeLogo } from "@/components/ui/doge-logo";
import { CheckCircle2, Mail, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const isDemo = searchParams.get("demo") === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <DogeLogo size={48} className="mx-auto" />
          <h1 className="text-2xl font-bold">Doge Consulting</h1>
        </div>

        {/* Success Card */}
        <Card>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="h-20 w-20 mx-auto text-emerald-500" />
            <h2 className="text-2xl font-bold text-emerald-700">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your payment has been processed successfully. Thank you for your business!
            </p>

            {isDemo && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                <p className="font-medium">🧪 Demo Mode</p>
                <p>This was a simulated payment. No real charges were made.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardContent className="pt-6 pb-6 space-y-4">
            <h3 className="font-semibold text-lg">What happens next?</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-teal" />
                <div>
                  <p className="font-medium text-sm">Email Confirmation</p>
                  <p className="text-xs text-muted-foreground">You&apos;ll receive a payment receipt shortly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 mt-0.5 text-teal" />
                <div>
                  <p className="font-medium text-sm">Order Processing</p>
                  <p className="text-xs text-muted-foreground">Our team will begin sourcing and preparing your shipment.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ArrowRight className="h-5 w-5 mt-0.5 text-teal" />
                <div>
                  <p className="font-medium text-sm">Tracking Updates</p>
                  <p className="text-xs text-muted-foreground">You&apos;ll get tracking info once your shipment is on the way.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <Link href="/track">
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" /> Track Your Order
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground">
            Reference: {token?.substring(0, 12)}…
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Doge Consulting Group Limited
        </p>
      </div>
    </div>
  );
}
