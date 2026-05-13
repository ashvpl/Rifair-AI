
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Rifair AI",
  description: "Learn about our service-based refund policy and technical error protections.",
};

export default function RefundPolicy() {
  return (
    <>
      <div className="legal-hero">
        <div className="label">Legal</div>
        <h1>Refund Policy</h1>
        <p>Last updated: May 2, 2026 &nbsp;·&nbsp; Effective: May 2, 2026</p>
      </div>

      <div className="legal-container">
        <div className="summary-grid">
          <div className="summary-card red">
            <div className="icon">✕</div>
            <h4>Strict No-Refund</h4>
            <p>Subscriptions are non-refundable once any paid plan services have been accessed or used</p>
          </div>
          <div className="summary-card green">
            <div className="icon">✓</div>
            <h4>Service Delivery</h4>
            <p>Full refund if you are unable to access services due to technical failure or platform glitches</p>
          </div>
          <div className="summary-card amber">
            <div className="icon">!</div>
            <h4>Billing Errors</h4>
            <p>Immediate correction and refund for duplicate charges or payment processing errors</p>
          </div>
        </div>

        <div className="legal-highlight">
          <strong>Our Philosophy:</strong> Rifair AI provides immediate value through AI-powered processing and proprietary algorithms. Because these resources are consumed the moment a service is initiated, we maintain a strict refund policy centered on successful service delivery and technical integrity.
        </div>

        <section id="overview" className="legal-section">
          <h2>Overview</h2>
          <p>Rifair AI provides digital, AI-driven hiring intelligence. Due to the immediate and irreversible nature of AI inference and data processing, our refund policy is strictly based on the successful delivery of the Service. By subscribing to a paid plan, you acknowledge that your right to a refund is limited to cases of technical failure or billing errors.</p>
          <p>This policy is governed by the laws of India and adheres to the Consumer Protection Act, 2019, specifically regarding the provision of digital services.</p>
        </section>

        <section id="eligible" className="legal-section">
          <h2>When you are eligible for a refund</h2>
          
          <h3>1. Failure of Service Delivery</h3>
          <p>If you have successfully paid for a subscription or add-on but are unable to access the paid features or receive analysis results due to platform glitches, technical errors, or extended outages (exceeding 24 hours), you are entitled to a full refund of that billing period if the issue cannot be resolved promptly.</p>

          <h3>2. Payment and Billing Errors</h3>
          <p>We will issue full refunds for the following billing-related issues:</p>
          <ul>
            <li><strong>Duplicate Charges:</strong> Multiple charges for the same subscription period due to payment gateway errors.</li>
            <li><strong>Incorrect Amounts:</strong> Charges that do not match the specified price of your selected plan at the time of purchase.</li>
            <li><strong>Unauthorized Renewals:</strong> In cases where a cancellation request was submitted prior to the renewal date but was not processed due to a system error.</li>
          </ul>

          <h3>3. Account Glitches</h3>
          <p>If your account remains in a "Free" state despite a successful transaction on Razorpay, and our support team is unable to manually provision your access within 48 hours, a full refund will be issued upon request.</p>
        </section>

        <section id="not-eligible" className="legal-section">
          <h2>When you are not eligible for a refund</h2>
          
          <div className="legal-warning">
            <strong>The "Consumption" Rule:</strong> Use of any paid feature — including but not limited to running a Bias Analysis, generating an Interview Kit, or analyzing a Job Description — constitutes full consumption of the service for that billing cycle. Once consumption begins, the fee for that period becomes non-refundable.
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Situation</th>
                  <th>Refund eligible?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paid but unable to access features (System Error)</td>
                  <td className="yes">Yes — Full Refund</td>
                </tr>
                <tr>
                  <td>Duplicate charges / Payment gateway error</td>
                  <td className="yes">Yes — Full Refund</td>
                </tr>
                <tr>
                  <td>Started using services (even one analysis)</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Change of mind / Found another tool</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Output quality did not meet personal expectations</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Forgotten renewal (reported after use)</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Accidental purchase (reported after use)</td>
                  <td className="no">No</td>
                </tr>
                <tr>
                  <td>Add-on packs (consumed on purchase)</td>
                  <td className="no">No</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>No Refunds for Change of Mind</h3>
          <p>We do not provide refunds for "change of mind" or if you decide you no longer need the tool after the subscription has already been used. We encourage users to explore the platform's free features before upgrading.</p>

          <h3>Output Accuracy</h3>
          <p>As Rifair AI utilizes third-party AI models, we cannot guarantee specific subjective outcomes. Refunds will not be issued based on disagreement with AI-generated analysis or scores, provided the system functioned as intended.</p>
        </section>

        <section id="process" className="legal-section">
          <h2>How to request a refund</h2>
          <ol className="process-steps">
            <li>
              <div className="step-num">1</div>
              <div className="step-content">
                <h4>Document the Issue</h4>
                <p>If you encountered a glitch, take a screenshot of the error message or the state of your account.</p>
              </div>
            </li>
            <li>
              <div className="step-num">2</div>
              <div className="step-content">
                <h4>Email support@rifairai.com</h4>
                <p>Provide your transaction ID and a brief description of the technical failure or billing error.</p>
              </div>
            </li>
            <li>
              <div className="step-num">3</div>
              <div className="step-content">
                <h4>Internal Audit</h4>
                <p>Our team will verify the platform logs to confirm the service failure. This process takes 24-48 hours.</p>
              </div>
            </li>
            <li>
              <div className="step-num">4</div>
              <div className="step-content">
                <h4>Reversal</h4>
                <p>Approved refunds are processed through Razorpay back to your original payment method within 5-7 business days.</p>
              </div>
            </li>
          </ol>
        </section>

        <section id="cancellation" className="legal-section">
          <h2>Cancellation</h2>
          <p>You may cancel your subscription at any time via the <strong>Settings &gt; Billing</strong> page. Cancellation prevents future charges but does not trigger a refund for the current period. Your access to paid features will continue until the end of the current billing cycle.</p>
        </section>

        <section id="contact-section" className="legal-section">
          <h2>Billing Enquiries</h2>
          <div className="legal-contact-box">
            <h3>Technical & Billing Support</h3>
            <p>Email: <a href="mailto:support@rifairai.com">support@rifairai.com</a></p>
            <p>Standard Response: Within 24 hours</p>
            <p style={{ marginTop: '12px', fontSize: '13px', opacity: 0.6 }}>
              For failed transactions where money was deducted but not credited, 
              please include your Razorpay Payment ID.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
