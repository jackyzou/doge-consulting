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

      <div className="mx-auto max-w-3xl px-4 py-12 prose prose-slate max-w-none">
        <h2>1. Overview</h2>
        <p>
          Doge Consulting Group Limited (&quot;Doge Consulting,&quot; &quot;we,&quot; &quot;us&quot;) provides product sourcing, international shipping, customs coordination, and delivery services from China to the United States. This policy outlines our shipping methods, timelines, and refund procedures.
        </p>

        <h2>2. Business Registration</h2>
        <p>
          <strong>Doge Consulting Group Limited</strong> (豆吉諮詢有限公司)<br />
          Rm 5, 27/F, China Resources Building, 26 Harbour Road, Wan Chai, Hong Kong<br />
          Email: dogetech77@gmail.com<br />
          US Phone: +1 (425) 223-0449<br />
          HK Phone: +852 6151-3289
        </p>

        <h2>3. Shipping Methods & Timelines</h2>
        <table>
          <thead>
            <tr><th>Method</th><th>Transit Time</th><th>Best For</th></tr>
          </thead>
          <tbody>
            <tr><td>LCL Sea Freight (Shared Container)</td><td>25–35 days port-to-port</td><td>Shipments under 15 CBM</td></tr>
            <tr><td>FCL Sea Freight (Full Container)</td><td>20–30 days port-to-port</td><td>Large orders (20ft, 40ft, 40ft HC)</td></tr>
            <tr><td>Full Service Door-to-Door</td><td>5–8 weeks total</td><td>End-to-end sourcing + shipping + delivery</td></tr>
          </tbody>
        </table>
        <p>
          Transit times are estimates and may vary due to weather, port congestion, customs inspections, or carrier schedule changes. We provide real-time tracking for all shipments via our <Link href="/tools/shipping-tracker" className="text-teal underline">Shipment Tracker</Link>.
        </p>

        <h2>4. Delivery Area</h2>
        <p>
          Our primary service area for last-mile delivery is the Greater Seattle / Puget Sound region (Seattle, Bellevue, Redmond, Tacoma, Kirkland, etc.). For other US destinations, cargo is delivered to the nearest port or customer-specified warehouse.
        </p>

        <h2>5. Shipping Costs</h2>
        <p>
          Shipping costs vary based on cargo volume (CBM), weight, origin port, destination port, and delivery method. All quotes are all-inclusive — covering freight, customs coordination, and delivery. Request a free quote at <Link href="/quote" className="text-teal underline">doge-consulting.com/quote</Link>.
        </p>

        <h2>6. Customs & Duties</h2>
        <p>
          Import duties are determined by your product&apos;s HTS code and are paid to US Customs and Border Protection (CBP). We coordinate customs clearance through licensed customs brokers. Duties are estimated in your quote but final amounts are determined by CBP. Use our <Link href="/tools/duty-calculator" className="text-teal underline">Duty Calculator</Link> for estimates.
        </p>

        <h2>7. Payment Terms</h2>
        <ul>
          <li><strong>Deposit:</strong> 70% of the total quote amount, due upon order confirmation</li>
          <li><strong>Balance:</strong> 30% remaining, due before delivery</li>
          <li><strong>Payment methods:</strong> Credit/debit card (via Airwallex), bank wire transfer</li>
          <li><strong>Currency:</strong> All prices quoted in USD</li>
        </ul>

        <h2>8. Cargo Protection</h2>
        <p>
          All shipments are professionally packed for ocean transport with moisture barriers, corner protectors, and crating as appropriate. Optional comprehensive cargo protection is available through our third-party logistics partners, covering damage, loss, and delays. We strongly recommend protection for shipments over $5,000.
        </p>

        <h2>9. Refund Policy</h2>
        <h3>9.1 Before Production</h3>
        <p>
          If you cancel your order before production begins at the factory, you are eligible for a full refund of your deposit minus any non-recoverable costs (samples, factory deposits already paid).
        </p>
        <h3>9.2 During Production</h3>
        <p>
          Once production has started, cancellations may be subject to factory charges. We will negotiate on your behalf to minimize costs. Any refund will be the deposit minus actual costs incurred.
        </p>
        <h3>9.3 After Shipment</h3>
        <p>
          Once cargo has been shipped, refunds are generally not available as the logistics chain is in motion. If goods arrive damaged, claims are handled through the cargo protection provider (if opted in) or through the carrier&apos;s standard liability.
        </p>
        <h3>9.4 Quality Issues</h3>
        <p>
          If goods arrive with defects that were not present during pre-shipment inspection, we will work with the factory on warranty claims, replacement, or partial refund at our discretion. Photo documentation is required within 7 days of delivery.
        </p>
        <h3>9.5 Refund Processing</h3>
        <p>
          Approved refunds are processed within 10 business days via the original payment method. Bank wire refunds may take an additional 3–5 business days.
        </p>

        <h2>10. Damaged or Missing Goods</h2>
        <ul>
          <li>Photograph all damage immediately upon delivery — before fully unpacking</li>
          <li>Note any damage on the delivery receipt (do NOT sign &quot;received in good condition&quot; if damaged)</li>
          <li>Contact us within 72 hours at dogetech77@gmail.com with photos and your order number</li>
          <li>If cargo protection was purchased, we will file the claim on your behalf</li>
        </ul>

        <h2>11. Contact Us</h2>
        <p>
          For questions about shipping, refunds, or your order status:<br />
          Email: dogetech77@gmail.com<br />
          Phone: +1 (425) 223-0449<br />
          <Link href="/contact" className="text-teal underline">Contact Form</Link>
        </p>
      </div>
    </div>
  );
}
