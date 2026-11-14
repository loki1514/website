import "./landing.css";
import { Landing } from "@/components/landing/landing";
import { siteFonts } from "@/lib/site-fonts";

export default function Home() {
  return <Landing fonts={siteFonts} />;
}
