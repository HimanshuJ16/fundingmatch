import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white min-h-screen text-[#182744] font-sans">
      <div className="container mx-auto px-4 py-16 max-w-[960px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-['Roobert-SemiBold',Helvetica]">
          Privacy Policy
        </h1>
        <p className="text-lg text-[#182744] opacity-70 mb-12">
          Last updated: {new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-10 text-base md:text-lg leading-relaxed font-['Roobert-Regular',Helvetica]">
          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              1. Who We Are
            </h2>
            <p className="mb-4">FundingMatch.ai is operated by:</p>
            <address className="not-italic mb-4 pl-4 border-l-4 border-gray-200">
              <span className="font-semibold">EFG Group Ltd</span>
              <br />
              Ground Floor, 5 North Court
              <br />
              Armstrong Road
              <br />
              Maidstone
              <br />
              Kent
              <br />
              ME15 6JZ
              <br />
              England
            </address>
            <p className="mb-4">
              <a
                href="mailto:hello@fundingmatch.ai"
                className="text-blue-600 hover:underline"
              >
                hello@fundingmatch.ai
              </a>
            </p>
            <p className="mb-4">
              FundingMatch.ai provides an AI-powered business funding matching
              platform that helps UK businesses identify and connect with lenders
              most likely to offer them funding, based on their profile and
              financial data.
            </p>
            <p>We act as an introducer only and are not a lender.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              2. Information We Collect
            </h2>

            <h3 className="text-xl font-semibold mb-2 mt-6">Business Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Company name and registration number</li>
              <li>Trading address and business activity</li>
              <li>Length of time trading</li>
              <li>Requested funding amount</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-6">Director / Owner Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Full name</li>
              <li>Date of birth</li>
              <li>Residential address</li>
              <li>Homeownership status</li>
              <li>Email address and phone number</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-6">Financial Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Business bank statements (uploaded files or via Open Banking)</li>
              <li>Transaction data, balances, and cashflow information (read-only)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-2 mt-6">Credit Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Soft credit search data (e.g. via Experian)</li>
              <li>Public record indicators such as CCJs or insolvency markers</li>
            </ul>
            <p className="mt-2 text-sm italic">
              We only perform soft credit checks. These do not affect credit scores.
            </p>

            <h3 className="text-xl font-semibold mb-2 mt-6">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>IP address</li>
              <li>Device and browser details</li>
              <li>Website usage analytics and cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              3. How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Assess funding suitability</li>
              <li>Match applicants to lender underwriting criteria</li>
              <li>Filter out lenders unlikely to approve the application</li>
              <li>Introduce businesses to relevant funding providers</li>
              <li>Improve our AI matching models</li>
              <li>Meet legal, regulatory, and fraud-prevention obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              4. Open Banking
            </h2>
            <p>Where Open Banking is selected:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access is read-only</li>
              <li>We cannot move funds or initiate payments</li>
              <li>Data is used solely for affordability and underwriting assessment</li>
              <li>Access is time-limited and can be revoked at any time</li>
            </ul>
            <p className="mt-4">
              Open Banking connections are provided by FCA-authorised third-party
              providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              5. Data Sharing
            </h2>
            <p>We may share information with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Third-party lenders and funding providers</li>
              <li>Credit reference agencies (soft searches only)</li>
              <li>Open Banking providers</li>
              <li>Technology and infrastructure partners</li>
              <li>Regulators or law enforcement where legally required</li>
            </ul>
            <p className="mt-4 font-semibold">We do not sell personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              6. Lawful Basis for Processing
            </h2>
            <p>We process data under:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Consent</li>
              <li>Contractual necessity</li>
              <li>Legitimate interests</li>
              <li>Legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              7. Data Retention
            </h2>
            <p>
              Data is retained only for as long as necessary to provide our services and meet regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              8. Your Rights
            </h2>
            <p>You may request to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access your data</li>
              <li>Correct inaccuracies</li>
              <li>Request deletion</li>
              <li>Restrict or object to processing</li>
              <li>Withdraw consent</li>
            </ul>
            <p className="mt-4">
              You also have the right to complain to the Information Commissioner’s Office (ICO).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              9. Cookies
            </h2>
            <p>
              We use cookies for functionality and analytics. You can manage these through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              10. Updates
            </h2>
            <p>
              This policy may be updated periodically. The latest version will always appear on our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
