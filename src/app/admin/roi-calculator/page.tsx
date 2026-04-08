"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Calculator, DollarSign, TrendingUp, Package, Truck, RefreshCcw,
  FileText, ArrowRight, ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";

interface CostBreakdown {
  // Product costs
  productCostCNY: number;
  productCostUSD: number;
  quantity: number;
  totalProductCost: number;

  // Shipping
  weightKg: number;
  shippingRatePerKg: number;
  shippingCost: number;
  shippingMethod: string;

  // Duties & taxes
  dutyRate: number;
  dutyCost: number;
  section301Rate: number;
  section301Cost: number;
  totalDuty: number;

  // Fees
  paymentProcessingRate: number;
  paymentProcessingFee: number;
  customsBrokerFee: number;
  insuranceRate: number;
  insuranceCost: number;

  // Margins
  marginRate: number;

  // Totals
  totalCOGS: number;
  sellingPrice: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalRevenue: number;
  totalProfit: number;
  roi: number;
}

export default function ROICalculatorPage() {
  // Currency
  const [exchangeRate, setExchangeRate] = useState(7.25);
  const [rateSource, setRateSource] = useState("loading...");
  const [inputCurrency, setInputCurrency] = useState<"USD" | "CNY">("CNY");

  // Product inputs
  const [productName, setProductName] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("100");
  const [weightPerUnit, setWeightPerUnit] = useState("");

  // Shipping inputs
  const [shippingMethod, setShippingMethod] = useState("sea-lcl");
  const [shippingRatePerKg, setShippingRatePerKg] = useState("3.50");

  // Duty inputs
  const [dutyRate, setDutyRate] = useState("0");
  const [section301Rate, setSection301Rate] = useState("25");

  // Fee inputs
  const [paymentProcessingRate, setPaymentProcessingRate] = useState("2.9");
  const [customsBrokerFee, setCustomsBrokerFee] = useState("200");
  const [insuranceRate, setInsuranceRate] = useState("0.5");

  // Pricing
  const [marginRate, setMarginRate] = useState("15");
  const [targetSellingPrice, setTargetSellingPrice] = useState("");

  // Fetch live exchange rate
  useEffect(() => {
    fetch("/api/admin/exchange-rate")
      .then((r) => r.json())
      .then((d) => {
        setExchangeRate(d.rate);
        setRateSource(d.source === "fallback" ? "Fallback rate" : "Live rate");
      })
      .catch(() => setRateSource("Fallback rate"));
  }, []);

  // Calculate everything
  const calc = useCallback((): CostBreakdown | null => {
    const cost = parseFloat(unitCost) || 0;
    const qty = parseInt(quantity) || 0;
    const weight = parseFloat(weightPerUnit) || 0;
    const shipRate = parseFloat(shippingRatePerKg) || 0;
    const duty = parseFloat(dutyRate) || 0;
    const s301 = parseFloat(section301Rate) || 0;
    const ppRate = parseFloat(paymentProcessingRate) || 0;
    const brokerFee = parseFloat(customsBrokerFee) || 0;
    const insRate = parseFloat(insuranceRate) || 0;
    const margin = parseFloat(marginRate) || 0;

    if (cost <= 0 || qty <= 0) return null;

    // Convert product cost to USD
    const costUSD = inputCurrency === "CNY" ? cost / exchangeRate : cost;
    const costCNY = inputCurrency === "USD" ? cost * exchangeRate : cost;
    const totalProductCost = costUSD * qty;

    // Shipping
    const totalWeight = weight * qty;
    const shippingCost = totalWeight * shipRate;

    // Duties (applied to product value)
    const dutyCost = totalProductCost * (duty / 100);
    const section301Cost = totalProductCost * (s301 / 100);
    const totalDuty = dutyCost + section301Cost;

    // Insurance
    const insuranceCost = totalProductCost * (insRate / 100);

    // Total COGS
    const totalCOGS = totalProductCost + shippingCost + totalDuty + brokerFee + insuranceCost;

    // Selling price with margin
    const sellingPricePerUnit = targetSellingPrice
      ? parseFloat(targetSellingPrice)
      : (totalCOGS / qty) * (1 + margin / 100);
    const totalRevenue = sellingPricePerUnit * qty;

    // Payment processing fee (on revenue)
    const paymentProcessingFee = totalRevenue * (ppRate / 100);

    // Profit
    const totalProfit = totalRevenue - totalCOGS - paymentProcessingFee;
    const grossProfit = sellingPricePerUnit - totalCOGS / qty;
    const grossMarginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const roi = totalCOGS > 0 ? (totalProfit / totalCOGS) * 100 : 0;

    return {
      productCostCNY: costCNY,
      productCostUSD: costUSD,
      quantity: qty,
      totalProductCost,
      weightKg: weight,
      shippingRatePerKg: shipRate,
      shippingCost,
      shippingMethod,
      dutyRate: duty,
      dutyCost,
      section301Rate: s301,
      section301Cost,
      totalDuty,
      paymentProcessingRate: ppRate,
      paymentProcessingFee,
      customsBrokerFee: brokerFee,
      insuranceRate: insRate,
      insuranceCost,
      marginRate: margin,
      totalCOGS,
      sellingPrice: sellingPricePerUnit,
      grossProfit,
      grossMarginPercent,
      totalRevenue,
      totalProfit,
      roi,
    };
  }, [unitCost, quantity, weightPerUnit, shippingRatePerKg, dutyRate, section301Rate, paymentProcessingRate, customsBrokerFee, insuranceRate, marginRate, targetSellingPrice, inputCurrency, exchangeRate, shippingMethod]);

  const breakdown = calc();

  // Generate quote from calculation
  const generateQuote = async () => {
    if (!breakdown) return;
    try {
      const res = await fetch("/api/admin/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "ROI Calculator Quote",
          customerEmail: "",
          items: [{
            name: productName || "Product from ROI Calculator",
            quantity: breakdown.quantity,
            unitPrice: breakdown.sellingPrice,
            totalPrice: breakdown.totalRevenue,
          }],
          subtotal: breakdown.totalRevenue,
          shippingCost: breakdown.shippingCost,
          customsDuty: breakdown.totalDuty,
          insuranceCost: breakdown.insuranceCost,
          totalAmount: breakdown.totalRevenue,
          shippingMethod,
          notes: [
            `ROI Calculator Quote`,
            `Product: ${productName || "N/A"}`,
            `Unit cost: ¥${breakdown.productCostCNY.toFixed(2)} ($${breakdown.productCostUSD.toFixed(2)})`,
            `Qty: ${breakdown.quantity}`,
            `Total COGS: $${breakdown.totalCOGS.toFixed(2)}`,
            `Selling price: $${breakdown.sellingPrice.toFixed(2)}/unit`,
            `Margin: ${breakdown.grossMarginPercent.toFixed(1)}%`,
            `ROI: ${breakdown.roi.toFixed(1)}%`,
            `Exchange rate: 1 USD = ${exchangeRate} CNY`,
          ].join("\n"),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Quote ${data.quoteNumber} created!`);
      } else {
        toast.error("Failed to create quote");
      }
    } catch {
      toast.error("Failed to create quote");
    }
  };

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">ROI Calculator</h1>
          <p className="text-sm text-muted-foreground">Calculate pricing, margins, and generate quotes</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1">
            <ArrowLeftRight className="h-3 w-3" />
            1 USD = {exchangeRate.toFixed(4)} CNY
          </Badge>
          <span className="text-[10px] text-muted-foreground">{rateSource}</span>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
            fetch("/api/admin/exchange-rate").then(r => r.json()).then(d => {
              setExchangeRate(d.rate);
              setRateSource("Refreshed");
              toast.success("Rate updated");
            });
          }}>
            <RefreshCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── LEFT: Inputs ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Package className="h-4 w-4 text-teal" /> Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Product Name</Label>
                <Input placeholder="e.g., Marble Coffee Table" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Unit Cost</Label>
                  <div className="flex mt-1">
                    <Select value={inputCurrency} onValueChange={(v) => setInputCurrency(v as "USD" | "CNY")}>
                      <SelectTrigger className="w-20 rounded-r-none text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNY">¥ CNY</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="85.00" value={unitCost} onChange={(e) => setUnitCost(e.target.value)} className="rounded-l-none" type="number" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Quantity</Label>
                  <Input placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-1" type="number" />
                </div>
                <div>
                  <Label className="text-xs">Weight/unit (kg)</Label>
                  <Input placeholder="15" value={weightPerUnit} onChange={(e) => setWeightPerUnit(e.target.value)} className="mt-1" type="number" />
                </div>
                <div>
                  <Label className="text-xs">
                    {inputCurrency === "CNY" ? `= $${((parseFloat(unitCost) || 0) / exchangeRate).toFixed(2)} USD` : `= ¥${((parseFloat(unitCost) || 0) * exchangeRate).toFixed(2)} CNY`}
                  </Label>
                  <div className="mt-1 h-9 flex items-center text-sm text-muted-foreground bg-muted rounded-md px-3">
                    Total: ${fmt((parseFloat(unitCost) || 0) * (inputCurrency === "CNY" ? 1 / exchangeRate : 1) * (parseInt(quantity) || 0))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4 text-teal" /> Shipping & Logistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Shipping Method</Label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger className="mt-1 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sea-lcl">Sea LCL</SelectItem>
                      <SelectItem value="sea-fcl-20">Sea FCL 20ft</SelectItem>
                      <SelectItem value="sea-fcl-40">Sea FCL 40ft</SelectItem>
                      <SelectItem value="air-standard">Air Standard</SelectItem>
                      <SelectItem value="air-express">Air Express</SelectItem>
                      <SelectItem value="rail">Rail (China-Europe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Shipping Rate ($/kg)</Label>
                  <Input placeholder="3.50" value={shippingRatePerKg} onChange={(e) => setShippingRatePerKg(e.target.value)} className="mt-1" type="number" step="0.1" />
                </div>
                <div>
                  <Label className="text-xs">Customs Broker Fee ($)</Label>
                  <Input placeholder="200" value={customsBrokerFee} onChange={(e) => setCustomsBrokerFee(e.target.value)} className="mt-1" type="number" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duties & Fees */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-teal" /> Duties, Taxes & Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Base Duty Rate (%)</Label>
                  <Input placeholder="0" value={dutyRate} onChange={(e) => setDutyRate(e.target.value)} className="mt-1" type="number" step="0.1" />
                </div>
                <div>
                  <Label className="text-xs">Section 301 Tariff (%)</Label>
                  <Input placeholder="25" value={section301Rate} onChange={(e) => setSection301Rate(e.target.value)} className="mt-1" type="number" step="0.1" />
                </div>
                <div>
                  <Label className="text-xs">Payment Processing (%)</Label>
                  <Input placeholder="2.9" value={paymentProcessingRate} onChange={(e) => setPaymentProcessingRate(e.target.value)} className="mt-1" type="number" step="0.1" />
                </div>
                <div>
                  <Label className="text-xs">Insurance (%)</Label>
                  <Input placeholder="0.5" value={insuranceRate} onChange={(e) => setInsuranceRate(e.target.value)} className="mt-1" type="number" step="0.1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-teal" /> Pricing & Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Target Margin (%)</Label>
                  <Input placeholder="15" value={marginRate} onChange={(e) => { setMarginRate(e.target.value); setTargetSellingPrice(""); }} className="mt-1" type="number" step="0.5" />
                </div>
                <div>
                  <Label className="text-xs">Or Set Selling Price ($/unit)</Label>
                  <Input placeholder="Auto-calculated" value={targetSellingPrice} onChange={(e) => setTargetSellingPrice(e.target.value)} className="mt-1" type="number" step="0.01" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-4">
          {breakdown ? (
            <>
              {/* Summary card */}
              <Card className="border-teal/30 bg-gradient-to-br from-teal/5 to-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-teal">Profit Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center py-2">
                    <p className="text-3xl font-bold text-navy">${fmt(breakdown.sellingPrice)}</p>
                    <p className="text-xs text-muted-foreground">Selling price per unit</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-lg bg-white p-2 border">
                      <p className={`text-lg font-bold ${breakdown.grossMarginPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {breakdown.grossMarginPercent.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">Margin</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 border">
                      <p className={`text-lg font-bold ${breakdown.roi >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {breakdown.roi.toFixed(1)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">ROI</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total Revenue</span><span className="font-semibold">${fmt(breakdown.totalRevenue)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Total COGS</span><span className="font-semibold text-red-600">-${fmt(breakdown.totalCOGS)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Processing Fee</span><span className="text-red-600">-${fmt(breakdown.paymentProcessingFee)}</span></div>
                    <div className="border-t pt-1.5 flex justify-between font-bold">
                      <span>Net Profit</span>
                      <span className={breakdown.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                        ${fmt(breakdown.totalProfit)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs">
                  <div className="flex justify-between"><span>Product ({breakdown.quantity} × ${fmt(breakdown.productCostUSD)})</span><span>${fmt(breakdown.totalProductCost)}</span></div>
                  <div className="flex justify-between"><span>Shipping ({(breakdown.weightKg * breakdown.quantity).toFixed(0)}kg × ${breakdown.shippingRatePerKg}/kg)</span><span>${fmt(breakdown.shippingCost)}</span></div>
                  <div className="flex justify-between"><span>Base Duty ({breakdown.dutyRate}%)</span><span>${fmt(breakdown.dutyCost)}</span></div>
                  <div className="flex justify-between"><span>Section 301 ({breakdown.section301Rate}%)</span><span>${fmt(breakdown.section301Cost)}</span></div>
                  <div className="flex justify-between"><span>Customs Broker</span><span>${fmt(breakdown.customsBrokerFee)}</span></div>
                  <div className="flex justify-between"><span>Insurance ({breakdown.insuranceRate}%)</span><span>${fmt(breakdown.insuranceCost)}</span></div>
                  <div className="border-t pt-1 flex justify-between font-bold text-sm">
                    <span>Total COGS</span>
                    <span>${fmt(breakdown.totalCOGS)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground"><span>COGS per unit</span><span>${fmt(breakdown.totalCOGS / breakdown.quantity)}</span></div>
                </CardContent>
              </Card>

              {/* Generate Quote */}
              <Button onClick={generateQuote} className="w-full bg-navy hover:bg-navy/90">
                <FileText className="h-4 w-4 mr-2" /> Generate Quote
              </Button>
            </>
          ) : (
            <Card className="p-8 text-center">
              <Calculator className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Enter product details to see the cost breakdown and profit analysis.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
