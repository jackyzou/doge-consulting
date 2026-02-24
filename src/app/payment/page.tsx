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

export default function PaymentPage() {
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
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Your deposit of <strong className="text-foreground">{formatCurrency(order.deposit)}</strong> has been processed.
            Order <strong className="text-teal">{order.id}</strong> is now confirmed.
          </p>
          <Card className="text-left">
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between"><span>Order ID</span><span className="font-medium">{order.id}</span></div>
              <div className="flex justify-between"><span>Amount Paid</span><span className="font-medium text-teal">{formatCurrency(order.deposit)}</span></div>
              <div className="flex justify-between"><span>Balance Due</span><span className="font-medium">{formatCurrency(order.balance)}</span></div>
              <div className="flex justify-between"><span>Payment Method</span><span className="font-medium">{paymentMethod === "card" ? "Credit Card" : "Bank Transfer"}</span></div>
              <div className="flex justify-between"><span>Processed via</span><span className="font-medium">Airwallex</span></div>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground">A confirmation email has been sent. You can track your shipment at /track</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4 bg-teal/20 text-teal border-teal/30">Secure Payment</Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">Complete Your Payment</h1>
            <p className="mt-3 text-slate-300 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" /> Secured by Airwallex
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
                  <CardHeader><CardTitle className="text-lg">Payment Method</CardTitle></CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "bank")} className="space-y-3">
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === "card" ? "border-teal bg-teal/5" : "border-border/50"}`}>
                        <RadioGroupItem value="card" />
                        <CreditCard className="h-5 w-5 text-teal" />
                        <div className="flex-1">
                          <p className="font-medium">Credit / Debit Card</p>
                          <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex · Processed via Airwallex</p>
                        </div>
                      </label>
                      <label className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all ${paymentMethod === "bank" ? "border-teal bg-teal/5" : "border-border/50"}`}>
                        <RadioGroupItem value="bank" />
                        <Building className="h-5 w-5 text-teal" />
                        <div className="flex-1">
                          <p className="font-medium">Bank Transfer / Wire</p>
                          <p className="text-xs text-muted-foreground">ACH or Wire Transfer · Lower fees for large orders</p>
                        </div>
                      </label>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Card Form */}
                {paymentMethod === "card" && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="text-lg">Card Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input placeholder="4242 4242 4242 4242" className="mt-1" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Expiry Date</Label><Input placeholder="MM / YY" className="mt-1" /></div>
                        <div><Label>CVC</Label><Input placeholder="123" className="mt-1" /></div>
                      </div>
                      <div>
                        <Label>Cardholder Name</Label>
                        <Input placeholder="Name on card" className="mt-1" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Shield className="h-4 w-4 text-teal" />
                        Your payment information is encrypted and secure.
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Bank Transfer Instructions */}
                {paymentMethod === "bank" && (
                  <Card className="mt-6">
                    <CardHeader><CardTitle className="text-lg">Bank Transfer Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <p className="text-muted-foreground">Please transfer to the following account:</p>
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium">HSBC Hong Kong</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account Name</span><span className="font-medium">Doge Consulting Ltd</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account Number</span><span className="font-medium font-mono">XXX-XXXXXX-XXX</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">SWIFT Code</span><span className="font-medium font-mono">HSBCHKHHHKH</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span className="font-medium">USD</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Reference</span><span className="font-medium text-teal">{order.id}</span></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Alternatively, use our Airwallex virtual USD account for lower wire fees.
                        Contact us for details.
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
                      Processing...
                    </span>
                  ) : (
                    <>
                      Pay {formatCurrency(order.deposit)} Deposit
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
                  <CardHeader><CardTitle className="text-lg">Order Summary</CardTitle></CardHeader>
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
                      <div className="flex justify-between"><span className="text-muted-foreground">Furniture</span><span>{formatCurrency(order.subtotal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{formatCurrency(order.shipping)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Insurance</span><span>{formatCurrency(order.insurance)}</span></div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.total)}</span>
                    </div>
                    <div className="rounded-lg bg-teal/5 p-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-teal">Deposit (70%)</span>
                        <span className="font-bold text-teal">{formatCurrency(order.deposit)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Balance due before delivery</span>
                        <span>{formatCurrency(order.balance)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3 w-3" /> Powered by Airwallex · Hong Kong
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
