import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | MVR Consultants",
  description: "Privacy Policy for MVR Consultants.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a2f5e] mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm mb-8">Last Updated: May 2026</p>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              At MVR Consultants, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, disclose, and safeguard your information when you visit our website or use our services.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">1. Information We Collect</h2>
            <p>
              We may collect personal information that you voluntarily provide to us when you register on the
              website, express an interest in obtaining information about us or our products and services,
              participate in activities on the website, or otherwise contact us.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and physical address.</li>
              <li><strong>Academic Data:</strong> Educational history, test scores (IELTS/TOEFL/GRE/GMAT), and target programs.</li>
              <li><strong>Financial Data:</strong> Basic financial readiness information for visa purposes.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">2. How We Use Your Information</h2>
            <p>We use the information we collect or receive:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>To facilitate university admissions and visa processing.</li>
              <li>To communicate with you regarding your application status.</li>
              <li>To send you administrative information, marketing, and promotional communications.</li>
              <li>To respond to your inquiries and offer support.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">3. Sharing Your Information</h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services
              (e.g., sharing your profile with partner universities), to protect your rights, or to fulfill
              business obligations. We do not sell your personal data to third parties.
            </p>

            <h2 className="text-xl font-bold text-[#1a2f5e] mt-8 mb-4">4. Contact Us</h2>
            <p>
              If you have questions or comments about this notice, you may email us at{" "}
              <a href="mailto:guntur@mvrconsultants.org" className="text-[#c9a84c] hover:underline">
                guntur@mvrconsultants.org
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
