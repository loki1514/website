// Latur partners shown on the site (logos supplied by the founder, 10 Oct 2026; partners agreed to be shown).
export const PARTNERS = [
  { title: "NIKS Brownies & Burger", src: "/partners/brand-niks.webp" },
  { title: "Rooftop All Day Kitchen", src: "/partners/brand-rooftop.webp" },
  { title: "MH 12 Pav Bhaji", src: "/partners/brand-mh12-pav-bhaji.webp" },
  { title: "Baskin Robbins", src: "/partners/brand-baskin-robbins.webp" },
  { title: "Shri Shyam Bhoj", src: "/partners/brand-shri-shyam-bhoj.webp" },
  { title: "Alpaharam", src: "/partners/brand-alpaharam.webp" },
  { title: "Purushottam Super Market", src: "/partners/store-purushottam-icon.webp" },
];

// The One Local backend (OL-ui app/api). By default the browser calls this website's /ol-api, which the website forwards
// to the backend (next.config.ts), so it works from any device that can open the site, including a phone on the Wi-Fi.
// NEXT_PUBLIC_ONELOCAL_API points straight at a public backend instead.
export const API = (process.env.NEXT_PUBLIC_ONELOCAL_API ?? "/ol-api").replace(/\/$/, "");
