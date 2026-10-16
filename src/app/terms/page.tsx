import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Service Terms · OneLocal POS", description: "The terms for using the OneLocal POS app as a OneLocal partner business." };

export default function Terms() {
  return (
    <LegalPage title="Service Terms">
      <p>These terms are between you (the business and the person signing up for it) and {LEGAL.company} (“OneLocal”) for use of the {LEGAL.product} app and related services. By creating an account you agree to them.</p>

      <h2>1. Who can use it</h2>
      <p>You must be 18 or older, able to enter a binding contract, and authorised to act for the business. The information you give must be true and kept up to date.</p>

      <h2>2. Your account</h2>
      <p>You are responsible for what happens under your account and for the staff you let in. Keep your sign-in secure and tell us at once if you think someone else has used it. We may suspend an account that looks unsafe, fraudulent or in breach of these terms.</p>

      <h2>3. Verification</h2>
      <p>We check tax, identity and bank details before a business is approved. Approval is our decision. Saved details are not the same as verified details, and we may ask for more documents at any time.</p>

      <h2>4. Orders, prices and your duties</h2>
      <p>You set your own items and prices and are responsible for them, for the quality and legality of what you sell, for licences you need (for example food licences), and for charging and paying the taxes that apply to you. You must accept or reject online orders honestly and promptly, and must not misuse customer details: use them only to complete the order.</p>

      <h2>5. Fees and payments</h2>
      <p>Any fees, commissions and payout timing are those shown to you in the app or in a separate written agreement. This page does not set fees.</p>

      <h2>6. What you must not do</h2>
      <ul>
        <li>Upload documents that are not yours or are forged, or give false information.</li>
        <li>Sell anything illegal or prohibited, or use the app to harm others.</li>
        <li>Try to access other businesses’ data, break the app’s security or overload it.</li>
      </ul>

      <h2>7. Your data</h2>
      <p>How we handle personal information is explained in our <a href="/privacy">Privacy Policy</a>. You can ask to delete your account at any time: see <a href="/delete-account">Delete your account</a>.</p>

      <h2>8. Availability and liability</h2>
      <p>We work to keep the app running but cannot promise it will always be available or error-free. To the extent the law allows, OneLocal is not liable for indirect or lost-profit losses, and our total liability for a claim is limited to the fees you paid us in the three months before it. Nothing here limits liability that the law does not allow to be limited.</p>

      <h2>9. Ending</h2>
      <p>You may stop using the app and delete your account at any time. We may end or suspend your access if you breach these terms or the law. Records we must keep by law stay after the account closes.</p>

      <h2>10. Changes, law and contact</h2>
      <p>We may update these terms and will tell you before a material change applies. These terms are governed by the laws of India, and the courts at Latur, Maharashtra have jurisdiction. Questions: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>, {LEGAL.company}, {LEGAL.postalAddress}.</p>
    </LegalPage>
  );
}
