import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions for using Doge Consulting services, website, and tools.",
  alternates: { canonical: "https://doge-consulting.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <section className="gradient-hero py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-bold">Terms & Conditions</h1>
          <p className="mt-3 text-slate-300">Last updated: March 18, 2026</p>
        </div>
      </section>

      <div className="container mx-auto max-w-3xl px-4 py-16">
        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Doge Consulting website (doge-consulting.com) and services, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Company Information</h2>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="font-semibold">Doge Consulting Group Limited <span className="text-muted-foreground font-normal">(豆吉諮詢有限公司)</span></p>
              <ul className="list-none pl-0 text-sm text-muted-foreground space-y-1 mt-2">
                <li>Registered Address: Rm 5, 27/F, China Resources Building, 26 Harbour Road, Wan Chai, Hong Kong</li>
                <li>US Office: Seattle, Washington, USA</li>
                <li>China Office: Shenzhen, Guangdong, China</li>
                <li>Email: dogetech77@gmail.com</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              Doge Consulting provides product sourcing, international freight forwarding coordination, customs coordination, quality inspection coordination, and last-mile delivery services for goods shipped from China to the United States. We act as a <strong className="text-foreground">facilitator and coordinator</strong> — we are not a carrier, customs broker, or insurance provider. These services are provided through our network of licensed third-party partners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Quotes & Pricing</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All quotes are provided in USD and are valid for 30 days from the date of issue.</li>
              <li>Quotes are estimates based on current market rates, which may fluctuate due to carrier pricing, fuel surcharges, port congestion, or tariff changes.</li>
              <li>Final pricing is confirmed upon order placement and deposit payment.</li>
              <li>Import duties and taxes are estimated in quotes but the final amount is determined by US Customs and Border Protection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Payment Terms</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>A <strong className="text-foreground">70% deposit</strong> is required upon order confirmation.</li>
              <li>The remaining <strong className="text-foreground">30% balance</strong> is due before delivery.</li>
              <li>Payments are processed through Airwallex (credit/debit card) or bank wire transfer.</li>
              <li>All payments are in USD unless otherwise agreed in writing.</li>
              <li>Late payments may result in storage charges, shipment holds, or order cancellation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Order Cancellation</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <span className="text-green-600 font-semibold text-sm shrink-0">Before production:</span>
                <p className="text-sm text-muted-foreground">Full refund of deposit minus any non-recoverable costs (samples, factory deposits).</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                <span className="text-amber-600 font-semibold text-sm shrink-0">During production:</span>
                <p className="text-sm text-muted-foreground">Partial refund possible, subject to factory charges already incurred.</p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                <span className="text-red-600 font-semibold text-sm shrink-0">After shipment:</span>
                <p className="text-sm text-muted-foreground">No cancellation or refund — goods are in transit.</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">See our full <Link href="/shipping-policy" className="text-teal underline hover:no-underline">Shipping & Refund Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Quality & Inspections</h2>
            <p className="text-muted-foreground leading-relaxed">
              We coordinate pre-shipment quality inspections through third-party inspection services. Inspection reports and photos are shared with you for approval before shipping. Once you approve the inspection and authorize shipment, we are not liable for defects that were visible in the inspection materials.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Shipping & Delivery</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Transit times are estimates and not guaranteed. Delays may occur due to weather, port congestion, customs holds, or carrier issues.</li>
              <li>Risk of loss transfers to the buyer based on the agreed Incoterms (typically FOB origin port).</li>
              <li>We provide tracking information for all shipments.</li>
              <li>Delivery is to the address specified in the order. Additional delivery attempts may incur charges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Cargo Protection</h2>
            <p className="text-muted-foreground leading-relaxed">
              Optional cargo protection is available through our third-party logistics partners and is strongly recommended. We do not directly provide or underwrite insurance. All protection policies are between the buyer and the third-party provider. See our <Link href="/shipping-policy" className="text-teal underline hover:no-underline">Shipping & Refund Policy</Link> for claim procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Customs & Duties</h2>
            <p className="text-muted-foreground leading-relaxed">
              We coordinate customs clearance through licensed customs brokers. Import duties, taxes, and fees are the responsibility of the buyer. We provide estimates but the final amounts are determined by US Customs and Border Protection. We are not liable for customs holds, examinations, or additional duties beyond our estimates.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Limitation of Liability</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Our total liability for any claim is limited to the amount you paid for the specific service giving rise to the claim.</li>
              <li>We are not liable for indirect, consequential, or punitive damages.</li>
              <li>We are not liable for delays, losses, or damages caused by third-party carriers, customs authorities, weather events, or force majeure.</li>
              <li>Our liability for cargo loss or damage is limited to the carrier&apos;s standard liability unless additional cargo protection is purchased.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on doge-consulting.com — including text, graphics, tools, calculators, and software — is owned by Doge Consulting Group Limited and protected by copyright. You may not reproduce, distribute, or create derivative works without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Website Tools</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our free tools (CBM Calculator, Duty Calculator, Revenue Calculator, etc.) are provided for informational purposes. Results are estimates and should not be relied upon as the sole basis for business decisions. We make no guarantee of accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of our services is also governed by our <Link href="/privacy" className="text-teal underline hover:no-underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">15. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by the laws of the Hong Kong Special Administrative Region. Any disputes shall be resolved in the courts of Hong Kong, unless otherwise agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">16. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms at any time. Changes take effect when posted on this page. Continued use of our services constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">17. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms: <a href="mailto:dogetech77@gmail.com" className="text-teal underline hover:no-underline">dogetech77@gmail.com</a> · +1 (425) 223-0449 · <Link href="/contact" className="text-teal underline hover:no-underline">Contact Form</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
