
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Rifair AI",
  description: "Learn how Rifair AI collects, uses, and protects your data.",
};

export default function PrivacyPolicy() {
  return (
    <>
      <div className="legal-hero">
        <div className="label">Legal</div>
        <h1>Privacy Policy</h1>
        <p>Last updated: May 2, 2026 &nbsp;·&nbsp; Effective: May 2, 2026</p>
      </div>

      <div className="legal-container">
        <div className="legal-toc">
          <h3>Contents</h3>
          <ol>
            <li><a href="#who">Who we are</a></li>
            <li><a href="#collect">Information we collect</a></li>
            <li><a href="#use">How we use your information</a></li>
            <li><a href="#ai">AI processing and your data</a></li>
            <li><a href="#share">How we share your information</a></li>
            <li><a href="#retention">Data retention</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#rights">Your rights</a></li>
            <li><a href="#cookies">Cookies</a></li>
            <li><a href="#children">Children's privacy</a></li>
            <li><a href="#changes">Changes to this policy</a></li>
            <li><a href="#contact">Contact us</a></li>
          </ol>
        </div>

        <div className="legal-highlight">
          <strong>Plain English summary:</strong> We collect only what we need to run Rifair AI. We never sell your data. The interview questions and job descriptions you analyse are processed by AI models to give you results — we store these to power your history and improve our service. You can delete your data at any time.
        </div>

        <section id="who" className="legal-section">
          <h2>1. Who we are</h2>
          <p>Rifair AI ("Rifair", "we", "us", "our") is an AI-powered hiring intelligence platform that helps organisations detect and eliminate bias from interview questions, job descriptions, and hiring processes. Our platform is operated by the Rifair AI team.</p>
          <p>This Privacy Policy explains how we collect, use, store, and share information about you when you use our website at rifair.ai and our associated services (collectively, the "Service").</p>
          <p>By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
        </section>

        <section id="collect" className="legal-section">
          <h2>2. Information we collect</h2>
          <h3>Information you provide directly</h3>
          <ul>
            <li><strong>Account information:</strong> Your name, email address, and password when you create an account.</li>
            <li><strong>Payment information:</strong> Billing details processed securely through Razorpay. We do not store your full card number — Razorpay handles payment data under their own privacy policy.</li>
            <li><strong>Content you submit:</strong> Interview questions, job descriptions, candidate evaluation notes, and any other text you paste or type into our analysis tools.</li>
            <li><strong>Profile information:</strong> Company name, role, and preferences you optionally provide.</li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> Pages visited, features used, buttons clicked, time spent on each feature, and interaction patterns.</li>
            <li><strong>Device information:</strong> Browser type, operating system, screen resolution, and device type.</li>
            <li><strong>Log data:</strong> IP address, request timestamps, error logs, and performance data.</li>
            <li><strong>Session data:</strong> Session identifiers and navigation patterns within the platform.</li>
          </ul>

          <h3>Information from third parties</h3>
          <ul>
            <li><strong>Authentication providers:</strong> If you sign in via Google or other OAuth providers, we receive basic profile information they share with us.</li>
            <li><strong>Payment processors:</strong> Razorpay shares transaction status and basic billing information with us.</li>
          </ul>
        </section>

        <section id="use" className="legal-section">
          <h2>3. How we use your information</h2>
          <h3>To provide the Service</h3>
          <ul>
            <li>Analyse interview questions and job descriptions for bias</li>
            <li>Generate structured interview kits and evaluation reports</li>
            <li>Store your analysis history and results</li>
            <li>Process payments and manage your subscription</li>
            <li>Send transactional emails (welcome, receipts, limit warnings)</li>
          </ul>

          <h3>To improve the Service</h3>
          <ul>
            <li>Understand how features are used to prioritise improvements</li>
            <li>Identify and fix bugs and performance issues</li>
            <li>Build aggregate, anonymised insights about bias patterns in hiring</li>
            <li>Train and improve our personalisation algorithms</li>
          </ul>

          <h3>To communicate with you</h3>
          <ul>
            <li>Send product updates and new feature announcements</li>
            <li>Notify you of usage limits and subscription changes</li>
            <li>Respond to support requests</li>
            <li>Send retention reminders if you have unused analyses or kits</li>
          </ul>
          <p>We will never send you unsolicited marketing emails without your consent. You can unsubscribe from non-transactional emails at any time.</p>
        </section>

        <section id="ai" className="legal-section">
          <h2>4. AI processing and your data</h2>
          <div className="legal-highlight">
            <strong>Important:</strong> The content you submit (interview questions, job descriptions) is sent to third-party AI model providers to generate analysis results. By using our Service, you consent to this processing.
          </div>
          <p>Rifair AI uses the following AI model providers to process your submitted content:</p>
          <ul>
            <li><strong>Groq:</strong> Primary AI inference provider (Llama models)</li>
            <li><strong>Google Gemini:</strong> Secondary AI provider</li>
            <li><strong>Anthropic Claude:</strong> Fallback AI provider</li>
          </ul>
          <p>Content submitted to these providers is governed by their respective privacy policies and terms of service. We use these providers in API mode, which generally means your data is not used to train their public models — however, you should review each provider's current data usage policies.</p>
          <p>We cache analysis results in our own database (Supabase) to power your history feature and reduce repeat API costs. Cached results are associated with your account and subject to your data deletion rights.</p>

          <h3>What we do not do with your AI-processed content</h3>
          <ul>
            <li>We do not sell your interview questions or job descriptions to any third party</li>
            <li>We do not use your specific submitted content to train our own AI models without your explicit consent</li>
            <li>We do not share your individual analysis results with other users</li>
          </ul>
        </section>

        <section id="share" className="legal-section">
          <h2>5. How we share your information</h2>
          <p>We do not sell, rent, or trade your personal information. We share data only in the following circumstances:</p>
          <h3>Service providers</h3>
          <p>We share data with trusted third-party vendors who help us operate the Service:</p>
          <ul>
            <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
            <li><strong>Vercel:</strong> Hosting and deployment</li>
            <li><strong>Razorpay:</strong> Payment processing</li>
            <li><strong>Resend:</strong> Transactional email delivery</li>
            <li><strong>Groq / Google / Anthropic:</strong> AI model inference</li>
          </ul>

          <h3>Legal requirements</h3>
          <p>We may disclose your information if required to do so by law, court order, or governmental authority, or if we believe in good faith that such disclosure is necessary to protect our rights, your safety, or the safety of others.</p>

          <h3>Business transfers</h3>
          <p>If Rifair AI is acquired, merged, or its assets are transferred, your information may be transferred as part of that transaction. We will notify you via email before your information becomes subject to a different privacy policy.</p>
        </section>

        <section id="retention" className="legal-section">
          <h2>6. Data retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide the Service. Specifically:</p>
          <ul>
            <li><strong>Account data:</strong> Retained until you delete your account</li>
            <li><strong>Analysis history:</strong> Retained for 12 months on Free plan, 24 months on Starter, indefinitely on Growth</li>
            <li><strong>Payment records:</strong> Retained for 7 years as required by Indian financial regulations</li>
            <li><strong>Usage event logs:</strong> Retained for 90 days for analytics purposes</li>
            <li><strong>Email logs:</strong> Retained for 30 days</li>
          </ul>
          <p>When you delete your account, we delete or anonymise all personal data within 30 days, except where retention is required by law.</p>
        </section>

        <section id="security" className="legal-section">
          <h2>7. Security</h2>
          <p>We implement industry-standard security measures to protect your information:</p>
          <ul>
            <li>All data transmitted over HTTPS with TLS encryption</li>
            <li>Database access controlled by Row Level Security (RLS) policies</li>
            <li>Passwords hashed using bcrypt — we never store plain text passwords</li>
            <li>API keys and secrets stored in environment variables, never in code</li>
            <li>Regular security reviews of our infrastructure</li>
          </ul>
          <p>No method of transmission or storage is 100% secure. If you discover a security reporting, please report it to rifairaiteam@gmail.com and we will respond within 48 hours.</p>
        </section>

        <section id="rights" className="legal-section">
          <h2>8. Your rights</h2>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of all personal data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Portability:</strong> Request your data in a machine-readable format (JSON)</li>
            <li><strong>Opt-out:</strong> Unsubscribe from non-transactional communications at any time</li>
            <li><strong>Restriction:</strong> Request that we restrict processing of your data in certain circumstances</li>
          </ul>
          <p>To exercise any of these rights, email us at rifairaiteam@gmail.com. We will respond within 30 days. For account deletion, you can also use the "Delete Account" option in your Settings page.</p>
        </section>

        <section id="cookies" className="legal-section">
          <h2>9. Cookies</h2>
          <p>We use cookies and similar tracking technologies to operate and improve the Service:</p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for authentication and session management. Cannot be disabled.</li>
            <li><strong>Analytics cookies:</strong> Help us understand how the Service is used. You can opt out via your browser settings.</li>
            <li><strong>Preference cookies:</strong> Remember your settings and preferences.</li>
          </ul>
          <p>We do not use advertising cookies or sell cookie data to advertisers.</p>
        </section>

        <section id="children" className="legal-section">
          <h2>10. Children's privacy</h2>
          <p>Rifair AI is a professional B2B service intended for use by individuals aged 18 and over. We do not knowingly collect personal information from children under 18. If you believe a child has provided us with personal information, please contact us at rifairaiteam@gmail.com and we will delete it promptly.</p>
        </section>

        <section id="changes" className="legal-section">
          <h2>11. Changes to this policy</h2>
          <p>We may update this Privacy Policy from time to time. When we make material changes, we will notify you by email and update the "Last updated" date at the top of this page. Your continued use of the Service after changes are posted constitutes your acceptance of the revised policy.</p>
        </section>

        <section id="contact" className="legal-section">
          <h2>12. Contact us</h2>
          <p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
          <div className="legal-contact-box">
            <h3>Privacy enquiries</h3>
            <p>Email: <a href="mailto:rifairaiteam@gmail.com">rifairaiteam@gmail.com</a></p>
            <p>General: <a href="mailto:rifairaiteam@gmail.com">rifairaiteam@gmail.com</a></p>
            <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.6 }}>We respond to all privacy requests within 30 days.</p>
          </div>
        </section>
      </div>
    </>
  );
}
