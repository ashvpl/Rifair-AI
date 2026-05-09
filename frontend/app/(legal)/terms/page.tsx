
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Rifair AI",
  description: "Read the terms and conditions for using Rifair AI's hiring intelligence platform.",
};

export default function TermsOfService() {
  return (
    <>
      <div className="legal-hero">
        <div className="label">Legal</div>
        <h1>Terms of Service</h1>
        <p>Last updated: May 2, 2026 &nbsp;·&nbsp; Effective: May 2, 2026</p>
      </div>

      <div className="legal-container">
        <div className="legal-toc">
          <h3>Contents</h3>
          <ol>
            <li><a href="#acceptance">Acceptance of terms</a></li>
            <li><a href="#service">Description of service</a></li>
            <li><a href="#accounts">Accounts and registration</a></li>
            <li><a href="#plans">Subscription plans and billing</a></li>
            <li><a href="#usage">Acceptable use</a></li>
            <li><a href="#content">Your content</a></li>
            <li><a href="#ip">Intellectual property</a></li>
            <li><a href="#disclaimer">Disclaimers</a></li>
            <li><a href="#liability">Limitation of liability</a></li>
            <li><a href="#termination">Termination</a></li>
            <li><a href="#governing">Governing law</a></li>
            <li><a href="#contact">Contact</a></li>
          </ol>
        </div>

        <div className="legal-highlight">
          <strong>Plain English summary:</strong> Use Rifair AI fairly and legally. Pay for what you use. Don't misuse the platform or resell our outputs without permission. Our tool assists human decision-making — final hiring decisions are always your responsibility.
        </div>

        <section id="acceptance" className="legal-section">
          <h2>1. Acceptance of terms</h2>
          <p>By accessing or using Rifair AI ("Service", "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.</p>
          <p>If you do not agree to these Terms, you may not use the Service. We reserve the right to update these Terms at any time. Continued use after changes constitutes acceptance.</p>
        </section>

        <section id="service" className="legal-section">
          <h2>2. Description of service</h2>
          <p>Rifair AI is an AI-powered hiring intelligence platform that provides:</p>
          <ul>
            <li>Bias detection and analysis of interview questions</li>
            <li>AI-generated rewrites of biased questions</li>
            <li>Structured interview kit generation</li>
            <li>Job description analysis and rewriting</li>
            <li>Candidate evaluation assistance</li>
            <li>Hiring analytics and trend reporting</li>
          </ul>

          <div className="legal-warning">
            <strong>Important disclaimer:</strong> Rifair AI is a decision-support tool. Our bias analysis, scores, evaluations, and recommendations are AI-generated outputs intended to assist human judgement — not replace it. Final hiring decisions are always the sole responsibility of the user. Rifair AI does not guarantee that use of our platform will eliminate bias, ensure legal compliance, or result in any particular hiring outcome.
          </div>
        </section>

        <section id="accounts" className="legal-section">
          <h2>3. Accounts and registration</h2>
          <h3>Eligibility</h3>
          <p>You must be at least 18 years of age to create an account. The Service is intended for professional use by HR professionals, recruiters, hiring managers, and business owners.</p>

          <h3>Account security</h3>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at rifairaiteam@gmail.com if you suspect unauthorised access to your account. We are not liable for any loss resulting from unauthorised use of your account.</p>

          <h3>Account accuracy</h3>
          <p>You agree to provide accurate and complete information when creating your account and to keep this information up to date. We reserve the right to suspend accounts with false or misleading information.</p>

          <h3>One account per user</h3>
          <p>Each account is for a single user unless you are on a Growth plan with multiple seats. Sharing account credentials across multiple users is not permitted on Free and Starter plans.</p>
        </section>

        <section id="plans" className="legal-section">
          <h2>4. Subscription plans and billing</h2>
          <h3>Plan tiers</h3>
          <p>Rifair AI offers the following subscription tiers: Free, Starter (₹999/month), and Growth (₹2,999/month). Feature availability varies by plan as described on our pricing page.</p>

          <h3>Billing</h3>
          <p>Paid plans are billed monthly or annually in advance. All prices are in Indian Rupees (INR) and inclusive of applicable taxes. Annual plans are billed as a single payment for 12 months.</p>

          <h3>Payment processing</h3>
          <p>Payments are processed by Razorpay. By providing payment information, you authorise us to charge your chosen payment method for recurring subscription fees. Your payment data is governed by Razorpay's terms and privacy policy.</p>

          <h3>Usage limits</h3>
          <p>Each plan includes a monthly allowance of analyses, interview kits, and JD analyses as specified on the pricing page. Unused allowances do not roll over to the next month. Add-on packs can be purchased to extend limits within a billing period.</p>

          <h3>Plan changes</h3>
          <p>You may upgrade your plan at any time. Upgrades take effect immediately and you will be charged the prorated difference for the remaining billing period. Downgrades take effect at the next billing renewal date.</p>

          <h3>Price changes</h3>
          <p>We reserve the right to change subscription prices. We will provide at least 30 days' notice of any price increases via email. Continued use after the effective date constitutes acceptance of new pricing.</p>
        </section>

        <section id="usage" className="legal-section">
          <h2>5. Acceptable use</h2>
          <h3>Permitted use</h3>
          <p>You may use Rifair AI to analyse interview questions and job descriptions for your own organisation's hiring processes, generate interview kits for roles you are actively recruiting for, and evaluate candidates you are genuinely considering for employment.</p>

          <h3>Prohibited use</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Resell, sublicense, or commercialise access to our platform without written permission</li>
            <li>Use the Service to generate content for competitor products or services</li>
            <li>Reverse engineer, scrape, or extract our AI models, prompts, or algorithms</li>
            <li>Submit content that is illegal, defamatory, or violates any third party's rights</li>
            <li>Attempt to circumvent usage limits, feature gates, or access controls</li>
            <li>Use automated scripts or bots to access the Service in excess of your plan limits</li>
            <li>Use the Service to make fully automated hiring decisions without human oversight</li>
            <li>Submit personal data of candidates without appropriate consent</li>
            <li>Use the platform in any way that violates applicable employment laws</li>
          </ul>

          <h3>Candidate data</h3>
          <p>When using candidate evaluation features, you are responsible for ensuring you have appropriate consent and legal basis for processing candidate data. Do not submit sensitive personal information (Aadhaar numbers, financial data, health information) through the platform.</p>
        </section>

        <section id="content" className="legal-section">
          <h2>6. Your content</h2>
          <h3>Ownership</h3>
          <p>You retain ownership of all content you submit to Rifair AI, including interview questions, job descriptions, and evaluation notes ("Your Content").</p>

          <h3>Licence to us</h3>
          <p>By submitting content, you grant Rifair AI a limited, non-exclusive licence to process, store, and transmit Your Content solely for the purpose of providing the Service to you. This includes sending Your Content to third-party AI providers as described in our Privacy Policy.</p>

          <h3>Aggregate data</h3>
          <p>We may use anonymised, aggregated insights derived from usage of the platform (e.g., "gender bias appears in X% of tech industry JDs") for product improvement, research, and marketing purposes. This data will never identify you or your organisation.</p>

          <h3>AI-generated outputs</h3>
          <p>Analysis results, rewritten questions, interview kits, and other AI-generated outputs ("Outputs") are provided to you for your use. You may use Outputs for your internal hiring processes. You may not represent AI-generated Outputs as independently created human work when selling or licensing them to third parties.</p>
        </section>

        <section id="ip" className="legal-section">
          <h2>7. Intellectual property</h2>
          <p>The Rifair AI platform, including its design, algorithms, prompts, codebase, branding, and all non-user-generated content, is owned by Rifair AI and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works of our platform without express written permission.</p>
          <p>The Rifair AI name, logo, and brand assets are our trademarks. You may not use them without our prior written consent.</p>
        </section>

        <section id="disclaimer" className="legal-section">
          <h2>8. Disclaimers</h2>
          <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
          <p>We do not warrant that:</p>
          <ul>
            <li>The Service will be uninterrupted, error-free, or secure</li>
            <li>AI-generated analysis results are accurate, complete, or legally compliant</li>
            <li>Use of the Service will ensure legal compliance with employment laws</li>
            <li>Bias scores or recommendations will prevent discrimination claims</li>
          </ul>
          <p>Rifair AI is a tool to assist human hiring decisions. It is not a legal compliance service. Always consult qualified legal counsel for employment law advice.</p>
        </section>

        <section id="liability" className="legal-section">
          <h2>9. Limitation of liability</h2>
          <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RIFAIR AI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE SERVICE.</p>
          <p>OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE THREE MONTHS PRECEDING THE CLAIM.</p>
          <p>Some jurisdictions do not allow limitation of liability — in such cases, our liability is limited to the maximum extent permitted by law.</p>
        </section>

        <section id="termination" className="legal-section">
          <h2>10. Termination</h2>
          <h3>Termination by you</h3>
          <p>You may cancel your subscription and delete your account at any time through your account Settings page. Cancellation takes effect at the end of your current billing period. Account deletion is immediate and permanent.</p>

          <h3>Termination by us</h3>
          <p>We reserve the right to suspend or terminate your account immediately, without notice, if you:</p>
          <ul>
            <li>Violate these Terms of Service</li>
            <li>Engage in fraudulent or illegal activity</li>
            <li>Fail to pay subscription fees</li>
            <li>Abuse the platform or other users</li>
          </ul>

          <h3>Effect of termination</h3>
          <p>Upon termination, your right to access the Service ceases immediately. We will retain your data for 30 days after termination in case of dispute, after which it will be deleted in accordance with our Privacy Policy. Paid subscription fees are non-refundable except as described in our Refund Policy.</p>
        </section>

        <section id="governing" className="legal-section">
          <h2>11. Governing law and disputes</h2>
          <p>These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.</p>
          <p>Before initiating formal legal proceedings, we encourage you to contact us at rifairaiteam@gmail.com to resolve disputes informally. We will make every reasonable effort to address your concerns within 30 days.</p>
        </section>

        <section id="contact" className="legal-section">
          <h2>12. Contact</h2>
          <p>For questions about these Terms, please contact us:</p>
          <div className="legal-contact-box">
            <h3>Legal enquiries</h3>
            <p>Email: <a href="mailto:rifairaiteam@gmail.com">rifairaiteam@gmail.com</a></p>
            <p>General: <a href="mailto:rifairaiteam@gmail.com">rifairaiteam@gmail.com</a></p>
            <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.6 }}>We respond to all legal enquiries within 5 business days.</p>
          </div>
        </section>
      </div>
    </>
  );
}
