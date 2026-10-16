import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Privacy Policy · OneLocal POS", description: "What the OneLocal POS app collects, why, who sees it, how long we keep it and how to delete it." };

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This policy explains how {LEGAL.company} (“we”, “OneLocal”) handles personal information in the {LEGAL.product} app and the OneLocal partner website. The app is for business owners and staff in India who sell through OneLocal. It is not for children: you must be 18 or older.</p>

      <h2>1. What we collect</h2>
      <table>
        <thead><tr><th>Information</th><th>When</th></tr></thead>
        <tbody>
          <tr><td>Name, email address, phone number, sign-in identity (Google or Apple account, or phone/email sign-in)</td><td>When you create an account</td></tr>
          <tr><td>Business name, business type, shop address and map location you confirm</td><td>When you register your business</td></tr>
          <tr><td>PAN, GSTIN (if registered), food licence details (if applicable)</td><td>Tax and business verification</td></tr>
          <tr><td>Aadhaar: only the last 4 digits, and only if you choose to enter them</td><td>Identity check. We do not ask for the full Aadhaar number.</td></tr>
          <tr><td>Bank account holder name, bank name, account number, IFSC, account type</td><td>So we can pay you and verify the account belongs to the business</td></tr>
          <tr><td>Documents you upload (PAN copy and other identity or business documents, as PDF, JPG or PNG), and your shop logo</td><td>Verification and your store profile</td></tr>
          <tr><td>Orders, bills, items, amounts, payment mode, and customer name, phone and delivery address on orders you handle</td><td>While you use the app</td></tr>
          <tr><td>Your agreement choices (terms, privacy notice, optional marketing updates) and the time you gave them</td><td>At sign-up</td></tr>
        </tbody>
      </table>
      <p>We do not ask for your bank PIN, OTP or internet-banking password. The app does not use your location, contacts, camera or microphone. Files are chosen by you through the phone’s file chooser.</p>

      <h2>2. Why we use it</h2>
      <ul>
        <li>To create and run your OneLocal account and store, and to show your orders.</li>
        <li>To check who you are and that the business is real (tax, identity and bank checks), and to pay you.</li>
        <li>To keep the service safe: preventing fraud, keeping audit records of who did what.</li>
        <li>To meet legal duties such as tax and accounting rules.</li>
        <li>To send you service messages. Marketing updates are sent only if you opted in, and you can opt out at any time.</li>
      </ul>

      <h2>3. Who sees it</h2>
      <p>We do not sell your information. It is seen by OneLocal staff who need it to run and verify accounts, and by service providers who process it for us: our database and sign-in provider (Supabase), our hosting provider, and Google or Apple when you sign in with them. Delivery partners and customers see only what is needed to complete an order (for example your store name and pickup address). We disclose information to authorities when the law requires.</p>

      <h2>4. How we protect it</h2>
      <p>Everything is sent over encrypted (HTTPS) connections. PAN and bank account numbers are stored encrypted. Uploaded documents are kept in private storage and are opened only through short-lived links for people who are allowed to see them. Access is limited by role and by business: one business cannot read another’s data.</p>

      <h2>5. How long we keep it</h2>
      <p>We keep your information while your account is active. When you ask us to delete your account we delete or anonymise your personal information within {LEGAL.deletionDays} days of verifying your request, except records we must keep by law (for example invoices and tax and accounting records) or while a legal hold or dispute applies. Those records are kept only for as long as the law requires, and then removed.</p>

      <h2>6. Your choices and rights</h2>
      <p>You can ask to see, correct, export or delete your personal information, to withdraw consent, and to complain. Under India’s Digital Personal Data Protection Act, 2023 you also have the right to nominate someone to act for you and to grievance redressal. To delete your account and data see <a href="/delete-account">our deletion page</a>. For anything else write to <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. We reply within 30 days.</p>

      <h2>7. Changes</h2>
      <p>If we change this policy in a way that matters we will tell you in the app or by email before it applies.</p>

      <h2>8. Contact</h2>
      <p>{LEGAL.company}, {LEGAL.postalAddress}. Email: <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.</p>
    </LegalPage>
  );
}
