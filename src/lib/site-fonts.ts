// The site's typefaces, shared by the landing page and the join flow. Baloo 2 and Mukta draw Latin and Devanagari,
// so the pages keep one voice in English, Hinglish and Hindi. Bangers (the comic headline face) has no Devanagari,
// so Hindi headlines fall back to Baloo 2.
import { Baloo_2, Bangers, Mukta, Yesteryear } from "next/font/google";

const baloo = Baloo_2({ variable: "--font-baloo", subsets: ["latin", "devanagari"], weight: ["500", "600", "700", "800"] });
const mukta = Mukta({ variable: "--font-mukta", subsets: ["latin", "devanagari"], weight: ["400", "500", "600"] });
// The script face only appears far down the home page, so it is not fetched ahead of time.
const script = Yesteryear({ variable: "--font-script", subsets: ["latin"], weight: "400", preload: false });
const pop = Bangers({ variable: "--font-pop", subsets: ["latin"], weight: "400" });

export const siteFonts = `${baloo.variable} ${mukta.variable} ${script.variable} ${pop.variable}`;
