import { Link } from "@/lib/router";

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Terms and Conditions
      </h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            1. Acceptance of Terms
          </h2>
          <p className="text-gray-600 leading-relaxed">
            By accessing or using Hopterlink ("the Platform"), you agree to be
            bound by these Terms and Conditions. If you do not agree to all the
            terms and conditions, you must not use the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            2. Platform Description
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Hopterlink is a marketplace connecting clients seeking local
            services with verified service providers. The Platform facilitates
            discovery, communication, booking, and payment between parties.
            Hopterlink does not directly provide any services and acts solely as
            an intermediary.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            3. User Accounts
          </h2>
          <p className="text-gray-600 leading-relaxed">
            You must create an account to use certain features. You are
            responsible for maintaining the confidentiality of your credentials
            and for all activities under your account. You must provide
            accurate, current, and complete information during registration.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            4. Payments and Fees
          </h2>
          <p className="text-gray-600 leading-relaxed">
            All payments are processed in Canadian Dollars (CAD). Hopterlink
            charges a 10% platform fee on completed transactions. Payments are
            held in escrow until the service is completed and confirmed by the
            client. Refund policies apply as outlined in our dispute resolution
            process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            5. Service Provider Obligations
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Service providers must maintain valid qualifications, licenses, and
            insurance as required by applicable law. Providers are independent
            contractors, not employees of Hopterlink. Providers must deliver
            services as described and agreed upon with clients.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            6. Client Obligations
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Clients must provide accurate descriptions of required services and
            make timely payments through the Platform. Clients agree to treat
            service providers with respect and maintain a safe working
            environment.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            7. Dispute Resolution
          </h2>
          <p className="text-gray-600 leading-relaxed">
            In the event of a dispute, both parties should first attempt to
            resolve the matter directly. If a resolution cannot be reached,
            Hopterlink provides a mediation process. Escrow funds will be held
            until the dispute is resolved by our administration team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            8. Limitation of Liability
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Hopterlink is not liable for the quality, safety, or legality of
            services provided through the Platform. Our liability is limited to
            the platform fees collected. We do not guarantee continuous,
            uninterrupted access to the Platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            9. Termination
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate
            these terms, engage in fraudulent activity, or receive consistently
            poor reviews. Users may close their accounts at any time by
            contacting support.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            10. Contact
          </h2>
          <p className="text-gray-600 leading-relaxed">
            For questions about these Terms, please contact us at{" "}
            <a
              href="mailto:legal@hopterlink.com"
              className="text-amber-600 hover:text-amber-700"
            >
              legal@hopterlink.com
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <Link
          to="/privacy"
          className="text-amber-600 hover:text-amber-700 font-medium text-sm"
        >
          View our Privacy Policy &rarr;
        </Link>
      </div>
    </div>
  );
}
