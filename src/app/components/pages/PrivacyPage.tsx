import { Link } from "@/lib/router";

export function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Information We Collect
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We collect information you provide directly: name, email address,
            phone number, location, and profile details. For service providers,
            we also collect business information, certifications, and identity
            verification documents. We automatically collect device information,
            usage data, and cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>To provide, maintain, and improve the Platform</li>
            <li>To process transactions and send related notifications</li>
            <li>To verify service provider identities and qualifications</li>
            <li>To facilitate communication between clients and providers</li>
            <li>
              To send service updates and marketing communications (with
              consent)
            </li>
            <li>To detect and prevent fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. Information Sharing
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We share your information only as necessary: with the other party in
            a booking (limited profile and contact details), with payment
            processors (Stripe) to complete transactions, and with service
            providers as needed for legal compliance. We do not sell your
            personal information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Data Storage and Security
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Your data is stored securely using Supabase infrastructure with
            encryption at rest and in transit. We implement row-level security
            policies to ensure users can only access their own data. Payment
            information is handled directly by Stripe and never stored on our
            servers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            5. Your Rights
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You have the right to access, correct, or delete your personal
            information. You can update your profile information at any time
            through your dashboard. To request data deletion, contact our
            support team. We will respond to all requests within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            6. Cookies and Tracking
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We use essential cookies for authentication and session management.
            Analytics cookies help us understand Platform usage patterns. You
            can control cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            7. Third-Party Services
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We use third-party services including Supabase (database and
            authentication), Stripe (payment processing), and cloud
            infrastructure providers. Each third party has its own privacy
            policy governing data handling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            8. Changes to This Policy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes via email or through the Platform.
            Continued use of the Platform after changes constitutes acceptance
            of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            9. Contact Us
          </h2>
          <p className="text-gray-600 leading-relaxed">
            For privacy-related questions or data requests, contact us at{" "}
            <a
              href="mailto:privacy@hopterlink.com"
              className="text-amber-600 hover:text-amber-700"
            >
              privacy@hopterlink.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link
          to="/terms"
          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
        >
          View our Terms and Conditions &rarr;
        </Link>
      </div>
    </div>
  );
}
