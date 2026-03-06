import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Doge Consulting",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: March 5, 2026</p>

      <div className="prose prose-slate max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            When you create an account or use our services, we may collect your name, email address,
            phone number, and company name. If you sign in with Google, we receive your Google profile
            information (name, email, and profile picture). We also collect information you provide
            when requesting quotes or placing orders.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your information to provide our consulting and shipping services, process your
            orders and quotes, communicate with you about your shipments, and improve our services.
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Google OAuth</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you choose to sign in with Google, we access only your basic profile information
            (name, email address, and profile picture) to create and manage your account.
            We do not access your Google contacts, calendar, drive, or any other Google services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Storage &amp; Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your data is stored securely and transmitted over encrypted connections (HTTPS).
            Passwords are hashed using industry-standard algorithms. We retain your data only
            as long as necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use a session cookie to keep you logged in. This cookie is essential for the
            functioning of our service and cannot be disabled while using authenticated features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy or your personal data, please contact
            us at <a href="mailto:dogetech77@gmail.com" className="text-teal underline">dogetech77@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
