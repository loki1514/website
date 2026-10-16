import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = { title: "Delete your account · OneLocal POS", description: "How to ask OneLocal to delete your OneLocal POS account and the personal data attached to it." };

const subject = encodeURIComponent("Delete my OneLocal POS account");
const body = encodeURIComponent("Please delete my OneLocal POS account.\n\nName:\nPhone number on the account:\nEmail on the account:\nBusiness name:\n");

export default function DeleteAccount() {
  return (
    <LegalPage title="Delete your OneLocal POS account">
      <p>You can ask us to delete your {LEGAL.product} account and the personal data attached to it. You do not need to install the app to ask.</p>

      <h2>How to ask</h2>
      <ol className="mt-3 list-decimal space-y-1.5 pl-6">
        <li>Send an email to <a href={`mailto:${LEGAL.contactEmail}?subject=${subject}&body=${body}`}>{LEGAL.contactEmail}</a> from the email address on your account, with the subject “Delete my OneLocal POS account”. If you cannot use that address, include the phone number and business name on the account.</li>
        <li>We will confirm that the request is really from you (for example by a code sent to the phone number on the account).</li>
        <li>We will finish within {LEGAL.deletionDays} days of confirming, and tell you when it is done. If you have an open order or unpaid balance we will tell you what must be settled first.</li>
      </ol>

      <h2>What is deleted</h2>
      <ul>
        <li>Your sign-in and profile: name, email, phone number.</li>
        <li>Your business profile and address.</li>
        <li>Identity and business documents you uploaded, PAN, GSTIN, the Aadhaar last 4 digits, and your bank details.</li>
        <li>Your shop logo, store settings and staff access.</li>
        <li>Your agreement and marketing choices.</li>
      </ul>

      <h2>What we may keep, and why</h2>
      <ul>
        <li>Bills, orders and payment records that tax and accounting law require us to keep. In these, personal details of customers are anonymised where possible, and the records are removed when the legal period ends.</li>
        <li>Records under a legal hold, dispute or fraud investigation, until it ends.</li>
        <li>A short note that an account was deleted, with the date, so that we can prove we honoured your request.</li>
      </ul>

      <h2>Only want some data removed?</h2>
      <p>Write to the same address saying which items (for example “remove my uploaded documents” or “stop marketing messages”) and we will do that without closing the account where the law allows.</p>

      <p>See also our <a href="/privacy">Privacy Policy</a>.</p>
    </LegalPage>
  );
}
