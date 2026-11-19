// The site's typefaces, shared by every page. All three are by Ek Type and were drawn to sit together in Latin and
// Devanagari, so the pages keep one voice in English, Hinglish and Hindi.
// Headings: Anek Latin, with Anek Devanagari for Hindi (the browser picks per letter). Text: Mukta.
import { Anek_Devanagari, Anek_Latin, Mukta } from "next/font/google";

const display = Anek_Latin({ variable: "--font-display", subsets: ["latin"], axes: ["wdth"] });
// Only Hindi headings need it, so it is not fetched ahead of time.
const displayDeva = Anek_Devanagari({ variable: "--font-display-deva", subsets: ["devanagari"], axes: ["wdth"], preload: false });
const text = Mukta({ variable: "--font-text", subsets: ["latin", "devanagari"], weight: ["400", "500", "600"] });

export const siteFonts = `${display.variable} ${displayDeva.variable} ${text.variable}`;
