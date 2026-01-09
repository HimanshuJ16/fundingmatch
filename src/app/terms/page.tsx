import React from "react";

const TermsPage = () => {
  return (
    <div className="bg-white min-h-screen text-[#182744] font-sans">
      <div className="container mx-auto px-4 py-16 max-w-[960px]">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 font-['Roobert-SemiBold',Helvetica]">
          Terms of Business
        </h1>
        <p className="text-lg text-[#182744] opacity-70 mb-12">
          Last updated: {new Date().toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="space-y-10 text-base md:text-lg leading-relaxed font-['Roobert-Regular',Helvetica]">
          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              1. About FundingMatch.ai
            </h2>
            <p className="mb-4">
              FundingMatch.ai is operated by EFG Group Ltd and provides an
              AI-driven business funding matching and introducer service.
            </p>
            <p>We:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Are not a lender</li>
              <li>Do not make lending decisions</li>
              <li>Do not guarantee funding</li>
              <li>Do not provide financial advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              2. Eligibility
            </h2>
            <p>By using the platform, you confirm that:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You are a UK business or authorised representative</li>
              <li>All information submitted is accurate and complete</li>
              <li>You have authority to provide company and director data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              3. Application & Matching Process
            </h2>
            <p>By submitting an application:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>You consent to automated assessment and filtering</li>
              <li>You understand that not all applications will be matched</li>
              <li>A match does not guarantee approval or funding</li>
              <li>
                Lenders may conduct additional checks, including hard credit searches,
                independently.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              4. Credit Searches
            </h2>
            <p>You authorise FundingMatch.ai to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Perform soft credit searches on businesses and/or directors</li>
              <li>Share relevant data with lenders for assessment</li>
            </ul>
            <p className="mt-4">Soft searches do not affect credit scores.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              5. Open Banking
            </h2>
            <p>Where Open Banking is selected:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Access is optional and user-initiated</li>
              <li>Access is read-only and time-limited</li>
              <li>You may revoke access at any time</li>
            </ul>
            <p className="mt-4">
              Failure to provide bank data may limit lender matches.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              6. No Liability for Lender Decisions
            </h2>
            <p>FundingMatch.ai is not responsible for:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Lender approval or decline decisions</li>
              <li>Funding terms offered</li>
              <li>Delays, withdrawals, or changes by lenders</li>
              <li>Losses arising from lender agreements</li>
            </ul>
            <p className="mt-4">
              All funding agreements are strictly between the business and the
              lender.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              7. Fees
            </h2>
            <p className="mb-4">
              Businesses are not charged to use FundingMatch.ai unless clearly
              stated.
            </p>
            <p>
              FundingMatch.ai may receive commercial remuneration from lenders for
              successful introductions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              8. Accuracy & Misuse
            </h2>
            <p>Submitting false, misleading, or fraudulent information may result in:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Application rejection</li>
              <li>Removal from the platform</li>
              <li>Reporting to relevant authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              9. Intellectual Property
            </h2>
            <p>
              All content, branding, software, and AI models are owned by EFG
              Group Ltd and may not be reproduced without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              10. Termination
            </h2>
            <p>We may suspend or terminate access if:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Terms are breached</li>
              <li>Misuse occurs</li>
              <li>Legal or regulatory obligations require action</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              11. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-['Roobert-SemiBold',Helvetica]">
              12. Contact
            </h2>
            <p className="mb-2">
              <a
                href="mailto:hello@fundingmatch.ai"
                className="text-blue-600 hover:underline"
              >
                hello@fundingmatch.ai
              </a>
            </p>
            <address className="not-italic">
              EFG Group Ltd, Ground Floor, 5 North Court, Armstrong Road, Maidstone,
              ME15 6JZ
            </address>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
