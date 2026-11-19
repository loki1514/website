import type { Metadata } from "next";
import "../landing.css";
import { Dashboard } from "@/components/dashboard";
import { siteFonts } from "@/lib/site-fonts";

export const metadata: Metadata = { title: "Partner dashboard · OneLocal" };
// Read when the page is asked for, so the address can be set on the server without a new build.
export const dynamic = "force-dynamic";

// The partner's dashboard is the One Local Partner app itself, running on the web (the same app as on the phone:
// it finishes the application first, then opens the POS once the shop is approved). PARTNER_APP_URL is where that
// web app is hosted. This page only frames it.
export default function DashboardPage() {
  const url = process.env.PARTNER_APP_URL?.trim().replace(/\/+$/, "") || null;
  return <Dashboard appUrl={url} fonts={siteFonts} />;
}
