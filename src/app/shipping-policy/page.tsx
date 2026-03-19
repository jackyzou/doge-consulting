import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping & Refund Policy",
  description: "Doge Consulting shipping timelines, delivery methods, and refund policy for products sourced and shipped from China to the USA.",
  alternates: { canonical: "https://doge-consulting.com/shipping-policy" },
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold">Shipping & Refund Policy</h1>
          <p className="mt-3 text-slate-300">Last updated: March 18, 2026</p>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              Doge Consulting Group Limited (&quot;Doge Consulting,&quot; &quot;we,&quot; &quot;us&quot;) provides product sourcing, international shipping, customs coordination, and delivery services from China to the United States. This policy outlines our shipping methods, timelines, and refund procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Business Registration</h2>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="font-semibold">Doge Consulting Group Limited <span className="text-muted-foreground font-normal">(豆吉諮詢有限公司)</span></p>
              <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1 mt-2">
                <li>Rm 5, 27/F, China Resources Building, 26 Harbour Road, Wan Chai, Hong Kong</li>
                <li>Email: dogetech77@gmail.com</li>
                <li>US: +1 (425) 223-0449 · HK: +852 6151-3289</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Shipping Methods & Timelines</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 pr-4 font-semibold">Method</th>
                    <th className="text-left py-3 pr-4 font-semibold">Transit Time</th>
                    <th className="text-left py-3 font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b"><td className="py-3 pr-4">LCL Sea Freight</td><td className="py-3 pr-4">25–35 days</td><td className="py-3">Shipments under 15 CBM</td></tr>
                  <tr className="border-b"><td className="py-3 pr-4">FCL Sea Freight</td><td className="py-3 pr-4">20–30 days</td><td className="py-3">Large orders (20ft, 40ft, 40ft HC)</td></tr>
                  <tr><td className="py-3 pr-4">Full Service Door-to-Door</td><td className="py-3 pr-4">5–8 weeks total</td><td className="py-3">End-to-end sourcing + shipping</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Transit times are estimates and may vary due to weather, port congestion, customs inspections, or carrier schedule changes. We provide real-time tracking for all shipments via our <Link href="/tools/shipping-tracker" className="text-teal underline hover:no-underline">Shipment Tracker</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Delivery Area</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our primary service area for last-mile delivery is the Greater Seattle / Puget Sound region (Seattle, Bellevue, Redmond, Tacoma, Kirkland, etc.). For other US destinations, cargo is delivered to the nearest port or customer-specified warehouse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Shipping Costs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Shipping costs vary based on cargo volume (CBM), weight, origin port, destination port, and delivery method. All quotes are all-inclusive — covering freight, customs coordination, and delivery. Request a free quote at <Link href="/quote" className="text-teal underline hover:no-underline">doge-consulting.com/quote</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Customs & Duties</h2>
            <p className="text-muted-foreground leading-relaxed">
              Import duties are determined by your product&apos;s HTS code and are paid to US Customs and Border Protection (CBP). We coordinate customs clearance through licensed customs brokers. Duties are estimated in your quote but final amounts are determined by CBP. Use our <Link href="/tools/duty-calculator" className="text-teal underline hover:no-underline">Duty Calculator</Link> for estimates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Payment Terms</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong className="text-foreground">Deposit:</strong> 70% of the total quote amount, due upon order confirmation</li>
              <li><strong className="text-foreground">Balance:</strong> 30% remaining, due before delivery</li>
              <li><strong className="text-foreground">Payment methods:</strong> Credit/debit card (via Airwallex), bank wire transfer</li>
              <li><strong className="text-foreground">Currency:</strong> All prices quoted in USD</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Cargo Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              All shipments are professionally packed for ocean transport with moisture barriers, corner protectors, and crating as appropriate. Optional comprehensive cargo protection is available through our third-party logistics partners, covering damage, loss, and delays. We strongly recommend protection for shipments over $5,000.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Refund Policy</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                <h3 className="text-sm font-semibold text-green-700 mb-1">9.1 Before Production</h3>
                <p className="text-sm text-muted-foreground">Full refund of your deposit minus any non-recoverable costs (samples, factory deposits already paid).</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                <h3 className="text-sm font-semibold text-amber-700 mb-1">9.2 During Production</h3>
                <p className="text-sm text-muted-foreground">Once production has started, cancellations may be subject to factory charges. We will negotiate on your behalf to minimize costs. Refund = deposit minus actual costs incurred.</p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                <h3 className="text-sm font-semibold text-red-700 mb-1">9.3 After Shipment</h3>
                <p className="text-sm text-muted-foreground">Once cargo has been shipped, refunds are generally not available as the logistics chain is in motion. Damage claims are handled through cargo protection or carrier liability.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                <h3 className="text-sm font-semibold text-blue-700 mb-1">9.4 Quality Issues</h3>
                <p className="text-sm text-muted-foreground">If goods arrive with defects not present during pre-shipment inspection, we work with the factory on warranty claims, replacement, or partial refund. Photo documentation required within 7 days of delivery.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              <strong className="text-foreground">Refund processing:</strong> Approved refunds are processed within 10 business days via the original payment method. Bank wire refunds may take an additional 3–5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Damaged or Missing Goods</h2>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-2">
                <li>Photograph all damage immediately upon delivery — before fully unpacking</li>
                <li>Note any damage on the delivery receipt (do NOT sign &quot;received in good condition&quot; if damaged)</li>
                <li>Contact us within <strong className="text-foreground">72 hours</strong> at dogetech77@gmail.com with photos and your order number</li>
                <li>If cargo protection was purchased, we will file the claim on your behalf</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about shipping, refunds, or your order status: <a href="mailto:dogetech77@gmail.com" className="text-teal underline hover:no-underline">dogetech77@gmail.com</a> · +1 (425) 223-0449 · <Link href="/contact" className="text-teal underline hover:no-underline">Contact Form</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
