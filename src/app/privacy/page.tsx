import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Doge Consulting",
  description: "How Doge Consulting collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: March 11, 2026 · Doge Consulting Group Limited
      </p>

      <div className="prose prose-slate max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly when using our services:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li><strong>Account information:</strong> Name, email address, and profile picture (when you sign in with Google or create an account with email/password).</li>
            <li><strong>Quote and order data:</strong> Product details, shipping addresses, quantities, and pricing when you request quotes or place orders.</li>
            <li><strong>Contact form submissions:</strong> Name, email, phone number, country code, subject, and message when you contact us.</li>
            <li><strong>Newsletter subscriptions:</strong> Email address and preferred language when you subscribe to our newsletter.</li>
            <li><strong>Tool usage:</strong> Inputs you provide to our free calculators and tools (CBM calculator, duty calculator, freight calculator, etc.). This data is processed client-side and is not stored on our servers unless part of a quote request.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Automatic Data Collection</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you visit our website, we automatically collect:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li><strong>Page views:</strong> We record which pages you visit, the date/time, and a session identifier to understand site usage patterns. This data is stored in our own database — we do not use third-party analytics services like Google Analytics.</li>
            <li><strong>Device information:</strong> Device type (desktop/mobile/tablet) derived from your browser&apos;s user agent string.</li>
            <li><strong>Country:</strong> Approximate geographic location derived from request headers (not precise GPS location).</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We do <strong>not</strong> use third-party tracking pixels, advertising cookies, or retargeting scripts.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Google OAuth</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you sign in with Google, we request access to your basic profile only:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Profile picture</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We <strong>do not</strong> access your Google contacts, calendar, drive, Gmail, or any other Google services. 
            Your Google authentication token is used solely to verify your identity and create your account. 
            You can revoke access at any time via your{" "}
            <a href="https://myaccount.google.com/permissions" className="text-teal underline" target="_blank" rel="noopener noreferrer">
              Google Account permissions page
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Provide our consulting, sourcing, and shipping services</li>
            <li>Process and track your quotes, orders, and shipments</li>
            <li>Send transactional emails (quote confirmations, order updates, payment receipts, shipping notifications)</li>
            <li>Send newsletter emails if you have subscribed (you can unsubscribe at any time)</li>
            <li>Respond to your contact form submissions and support inquiries</li>
            <li>Improve our website and services based on aggregate usage patterns</li>
            <li>Generate PDF documents (invoices, receipts, purchase orders) related to your orders</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We <strong>do not</strong> sell, rent, or share your personal information with third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies &amp; Sessions</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the following cookies:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li><strong>Session cookie (session):</strong> An httpOnly, secure cookie that keeps you logged in. This is essential for authenticated features and cannot be disabled while using your account. It expires when you log out.</li>
            <li><strong>Language preference:</strong> Stored in your browser&apos;s localStorage (not a cookie) to remember your chosen language (English, Chinese, Spanish, or French).</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-2">
            We do <strong>not</strong> use advertising cookies, social media tracking cookies, or any third-party cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Storage &amp; Security</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>All data is transmitted over encrypted HTTPS connections.</li>
            <li>Passwords are hashed using bcrypt with per-user salts.</li>
            <li>Session tokens are signed JWTs stored in httpOnly cookies (inaccessible to JavaScript).</li>
            <li>Our database is hosted on our own infrastructure — we do not use third-party cloud databases.</li>
            <li>Payment processing is handled by Airwallex, a PCI-DSS compliant payment processor. We do not store your credit card details.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Email Communications</h2>
          <p className="text-muted-foreground leading-relaxed">
            We send emails for the following purposes:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1 mt-2">
            <li><strong>Transactional:</strong> Quote confirmations, order updates, payment receipts, shipping notifications. These are essential to our service and cannot be opted out of while you have active orders.</li>
            <li><strong>Newsletter:</strong> Weekly trade news and import tips. You can unsubscribe at any time via the link in any newsletter email.</li>
            <li><strong>Blog notifications:</strong> New blog post alerts sent to subscribers. Opt-out available in each email.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li><strong>Access:</strong> You can view all your personal data in your account dashboard at any time.</li>
            <li><strong>Update:</strong> You can update your name, email, and password from your account settings.</li>
            <li><strong>Delete:</strong> You can request deletion of your account and all associated data by contacting us.</li>
            <li><strong>Export:</strong> You can download your quotes, orders, and documents from your account portal.</li>
            <li><strong>Unsubscribe:</strong> You can unsubscribe from newsletters at any time.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our services are intended for businesses and individuals aged 18 and older. We do not knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this privacy policy from time to time. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision. We encourage you to review this page periodically.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy, your personal data, or wish to exercise any of your rights, please contact us:
          </p>
          <ul className="list-none pl-0 text-muted-foreground space-y-1 mt-2">
            <li>📧 Email: <a href="mailto:dogetech77@gmail.com" className="text-teal underline">dogetech77@gmail.com</a></li>
            <li>📞 Phone: +1 (425) 223-0449</li>
            <li>🌐 Web: <a href="/contact" className="text-teal underline">doge-consulting.com/contact</a></li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-4">
            <strong>Doge Consulting Group Limited</strong><br />
            Seattle, WA, USA · Hong Kong SAR
          </p>
        </section>
      </div>
    </div>
  );
}
