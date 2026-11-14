import type { Metadata } from "next";
import "../landing.css";
import { Onboarding } from "@/components/onboarding";
import { siteFonts } from "@/lib/site-fonts";

export const metadata: Metadata = { title: "Partner onboarding · OneLocal" };

export default function JoinPage() {
  return <Onboarding fonts={siteFonts} />;
}
