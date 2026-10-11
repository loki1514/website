import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding";

export const metadata: Metadata = { title: "Partner onboarding · OneLocal" };

export default function JoinPage() {
  return <Onboarding />;
}
