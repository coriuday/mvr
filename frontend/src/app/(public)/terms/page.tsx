import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | MVR Consultants",
  description: "Terms and conditions for using MVR Consultants services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2f5e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Terms & Conditions
          </h1>
          <p className="text-gray-500 text-sm mb-8">Last Updated: May 2026</p>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Please read these Terms and Conditions carefully before using the MVR Consultants website
              or engaging our services.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing this website, we assume you accept these terms and conditions. Do not continue to use
              MVR Consultants if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">2. Our Services</h2>
            <p>
              MVR Consultants provides educational consulting, university admission assistance, visa guidance,
              and scholarship assistance. We do not guarantee admission to any specific university or the
              approval of any visa. Our role is strictly advisory and processing assistance based on the
              documents and information provided by you.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">3. User Responsibilities</h2>
            <p>
              You agree to provide accurate, current, and complete information during the consultation and
              application process. Submitting fraudulent documents or false information will result in immediate
              termination of our services and may be reported to relevant authorities or universities.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">4. Intellectual Property</h2>
            <p>
              Unless otherwise stated, MVR Consultants owns the intellectual property rights for all material
              on the website. All intellectual property rights are reserved. You may access this from
              MVR Consultants for your own personal use subjected to restrictions set in these terms.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">5. Disclaimer</h2>
            <p>
              The information provided by MVR Consultants is for general informational purposes only. All
              information on the site is provided in good faith, however, we make no representation or warranty
              of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability,
              availability, or completeness of any information on the site.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
