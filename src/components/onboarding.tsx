"use client";

// Partner onboarding: the application form. It asks a little at a time, one small step per screen, in the same pop
// style as the home page (see DESIGN.md): the question in comic lettering on the grass field, white pill inputs,
// yellow choices, a slim glass bar on top with the progress.
//
// What it collects is fixed by the database function submit_partner_application, which Proviyaa Master's review
// queue also reads: partner type, business, owner, phone, email, consent, what they sell, address, PIN, outlets,
// GSTIN and FSSAI (both optional), how orders reach customers, and a password for the Partner app login.
// Two answers that help the team's first call (how they bill today, when to call) travel in the free `notes` field.
//
// The draft is saved to One Local once the contact step is done, and the form also survives a reload on this
// browser. Back is always on screen, every step is a browser history entry so the phone's back gesture moves between
// steps, and Ol, the mascot, reacts to everything and hops under whichever text box you are typing in.
import { MapPin } from "./map-pin";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Candy, Check, ChefHat, ChevronLeft, Citrus, Coffee, CookingPot, Copy, Croissant, Drumstick, Fish, Flame, Hamburger, IceCreamCone, LayoutDashboard, Leaf, Pencil, Phone, Pizza, Popcorn, Sandwich, Soup, Store, Utensils, UtensilsCrossed, Wrench, type LucideIcon } from "lucide-react";
import taxonomy from "@/lib/partner-taxonomy.json";
import { API } from "@/lib/partners";
import { MascotFollower, useMascot } from "@/components/mascot";
import { ContourField } from "@/components/landing/contour-field";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, randomKey } from "@/lib/utils";

// A partner is a store, a restaurant or a service provider (Bible, chapter 6).
type PartnerType = "store" | "restaurant" | "service";
type Form = {
  partner_type: PartnerType; business_name: string; owner_name: string; phone: string; email: string; consent: boolean;
  category_family: string; category: string; categories: string[]; subcategories: string[];
  // The address in parts (0731: Master and the Partner app read the parts); `address` is them joined, for the review queue.
  address_line: string; locality: string; landmark: string; address: string; pin_code: string; location_lat: number | null; location_lng: number | null; outlets: string; gstin: string; fssai: string; services: string[]; own_delivery: boolean; whatsapp_ok: boolean;
  // Asked for the team's first call; sent in `notes`, not as fields of their own.
  billing: string; call_time: string;
  // 0740: the number the partner proved with the SMS code (empty until then; a changed number must be proven again)
  phone_verified: string;
};
const EMPTY: Form = { partner_type: "store", business_name: "", owner_name: "", phone: "", email: "", consent: false, category_family: "", category: "", categories: [], subcategories: [], address_line: "", locality: "", landmark: "", address: "", pin_code: "", location_lat: null, location_lng: null, outlets: "1", gstin: "", fssai: "", services: ["delivery"], own_delivery: false, whatsapp_ok: true, billing: "", call_time: "", phone_verified: "" };
type Screen = "name" | "type" | "you" | "verify" | "family" | "category" | "rtypes" | "where" | "delivery" | "papers" | "call" | "password" | "review";
// Drafts saved on this browser by the older, longer screens point at steps that are now split up.
const OLD_SCREENS: Record<string, Screen> = { start: "name", subcats: "category", business: "where", finish: "password", account: "password" };
const STORAGE = "onelocal.partner-onboarding.v1";
const TYPE_ICONS = { store: Store, restaurant: UtensilsCrossed, service: Wrench } as const;
// Each cuisine has its own drawn icon (the taxonomy names it). The names are the Partner app's cuisines (its server's taxonomy).
const CUISINE_ICONS: Record<string, LucideIcon> = { Flame, Leaf, ChefHat, Utensils, Soup, Drumstick, CookingPot, Popcorn, Sandwich, Pizza, Hamburger, Fish, Citrus, Coffee, Croissant, Candy, IceCreamCone };
// The storefront shown for each kind of business until a category is picked. There is no restaurant storefront yet,
// so the bakery stands in (bakery is a Restaurant category in the Bible).
const TYPE_ART: Record<PartnerType, string> = { store: "grocery-and-daily-needs-grocery", restaurant: "grocery-and-daily-needs-bakery-and-sweets", service: "service-health" };
const BILLING = ["Notebook or bill book", "Billing machine", "Another app", "Nothing yet"];
const CALL_TIMES = ["Morning", "Afternoon", "Evening", "Any time"];
const EASE = [0.16, 1, 0.3, 1] as const;
const icon = (slug: string) => `/onboarding/icons/${slug}.webp`;
const storeImg = (slug: string) => `/onboarding/stores/${slug}.webp`;

// The address the review queue reads in one line: shop and building, street and area, landmark, city.
const fullAddress = (f: Form) => [f.address_line, f.locality, f.landmark && `Near ${f.landmark}`, "Latur"].map(x => x.trim()).filter(Boolean).join(", ");

const digits10 = (v: string) => v.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, "");
const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, ""));
const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
const passwordOk = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

function screensFor(t: PartnerType): Screen[] {
  const what: Screen[] = t === "store" ? ["family", "category"] : t === "service" ? ["category"] : ["rtypes"];
  const delivery: Screen[] = t === "store" || t === "restaurant" ? ["delivery"] : [];
  return ["name", "type", "you", "verify", ...what, "where", ...delivery, "papers", "call", "password", "review"];
}

type Setter = <K extends keyof Form>(k: K, v: Form[K]) => void;

export function Onboarding({ fonts }: { fonts: string }) {
  const reduce = useReducedMotion();
  const { react, say } = useMascot();
  const [f, setF] = useState<Form>(EMPTY);
  // The password lives only in memory: never in the saved draft, never in the server's draft.
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [screen, setScreen] = useState<Screen>("name");
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");          // the SMS code being typed (never saved)
  const [codeSentTo, setCodeSentTo] = useState(""); // the number the last code went to
  const [done, setDone] = useState<{ reference: string | null; existing: boolean; login?: string; appCode?: boolean; blocked?: string } | null>(null);
  const key = useRef("");

  const flow = screensFor(f.partner_type);
  const index = Math.max(0, flow.indexOf(screen));
  // The browser history entries this page pushed, one per step, so Back can tell whether history.back() lands on the
  // previous step. Refs because the popstate listener lives for the whole page.
  const trail = useRef<Screen[]>([]);
  const screenRef = useRef(screen);
  const flowRef = useRef(flow);
  useEffect(() => { screenRef.current = screen; flowRef.current = flow; });

  useEffect(() => { const t = setTimeout(() => say("welcome", "waking"), 900); return () => clearTimeout(t); }, [say]);
  // Resume on this browser.
  useEffect(() => {
    let first: Screen = "name";
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw);
        const form: Form = { ...EMPTY, ...s.f };
        // An older draft may carry a partner type that is no longer offered.
        if (!(form.partner_type in TYPE_ICONS)) form.partner_type = "store";
        // Drafts saved before categories became multiple-choice carry only `category`.
        if (!Array.isArray(form.categories)) form.categories = [];
        if (!form.categories.length && form.category) form.categories = [form.category];
        // Drafts from before the address had parts carry one line: it becomes the first part.
        if (!form.address_line && form.address) form.address_line = form.address;
        const want = OLD_SCREENS[s.screen] ?? s.screen;
        first = screensFor(form.partner_type).includes(want) ? want : "name";
        setF(form); setScreen(first); key.current = s.key;
      }
    } catch { /* storage blocked */ }
    if (!key.current) key.current = randomKey();
    trail.current = [first];
    history.replaceState({ ...history.state, olStep: first, olDepth: 0 }, "");
  }, []);
  useEffect(() => { try { if (!done) localStorage.setItem(STORAGE, JSON.stringify({ f, screen, key: key.current })); } catch { /* ignore */ } }, [f, screen, done]);
  // Each step starts at the top, and the text box you were in lets go of focus so Ol goes home instead of staying
  // under a box that is leaving.
  useEffect(() => { (document.activeElement as HTMLElement | null)?.blur?.(); window.scrollTo({ top: 0 }); }, [screen, done]);

  // The browser's Back/Forward and the phone's back gesture move between steps instead of leaving the page.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = e.state?.olStep as Screen | undefined;
      const depth = e.state?.olDepth as number | undefined;
      if (!s || depth === undefined || !flowRef.current.includes(s)) return;
      const t = trail.current;
      if (depth < t.length) t.length = depth + 1; else t.push(s);
      t[depth] = s;
      setDir(flowRef.current.indexOf(s) < flowRef.current.indexOf(screenRef.current) ? -1 : 1);
      setError(null); setScreen(s);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (to: Screen, d: 1 | -1) => {
    setDir(d); setError(null); setScreen(to);
    trail.current.push(to);
    history.pushState({ ...history.state, olStep: to, olDepth: trail.current.length - 1 }, "");
  };
  const back = () => {
    const prev = flow[index - 1];
    if (!prev) return;
    say("back", "curious");
    const t = trail.current;
    if (t.length > 1 && t[t.length - 2] === prev) { history.back(); return; }
    setDir(-1); setError(null); setScreen(prev);
    t[t.length - 1] = prev;
    history.replaceState({ ...history.state, olStep: prev, olDepth: t.length - 1 }, "");
  };

  const set: Setter = useCallback((k, v) => { setF(p => ({ ...p, [k]: v })); setError(null); }, []);
  const family = taxonomy.store.families.find(x => x.name === f.category_family);
  const catList = f.partner_type === "store" ? family?.categories ?? [] : taxonomy.service.categories;
  // The storefront follows the kind of business, then the category picked most recently: every tick brings that
  // category's storefront forward, and unticking it goes back to the one picked before. `categories` keeps the order
  // they were ticked in; a category with no storefront of its own is passed over for the latest one that has one.
  const pickedArt = f.partner_type === "restaurant" ? undefined
    : [...f.categories].reverse().map(n => catList.find(c => c.name === n)?.store).find(Boolean);
  const hero = pickedArt ?? TYPE_ART[f.partner_type];

  const check = (s: Screen): string | null => {
    if (s === "name") return f.business_name.trim().length < 2 ? "Type your business name." : null;
    if (s === "you") return f.owner_name.trim().length < 2 ? "Type the owner's full name." : !phoneOk(f.phone) ? "Type a 10-digit mobile number." : !emailOk(f.email) ? "Type a valid email." : !f.consent ? "Please tick the box so we can save your application." : null;
    if (s === "family") return f.category_family ? null : "Choose one.";
    if (s === "category") return !f.categories.length ? "Choose at least one category." : f.subcategories.length > 30 ? "Tick up to 30 items." : !f.subcategories.length ? (f.partner_type === "service" ? "Tick at least one service you offer." : "Tick at least one thing you sell.") : null;
    if (s === "verify") return f.phone_verified === digits10(f.phone) ? null : !/^\d{6}$/.test(code) ? "Type the 6-digit code we sent to your number." : null;
    if (s === "rtypes") return f.subcategories.length ? null : "Pick at least one type of food.";
    if (s === "where") return f.location_lat == null ? "Move the map until the pin is on your shop." : f.address_line.trim().length < 2 ? "Type your shop number and building." : f.locality.trim().length < 2 ? "Type the street and area." : !/^[1-9]\d{5}$/.test(f.pin_code) ? "PIN code must be 6 digits." : null;
    if (s === "delivery") return f.services.length ? null : "Choose at least one.";
    if (s === "papers") return f.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(f.gstin.toUpperCase()) ? "GSTIN looks wrong (15 characters)." : f.fssai && !/^\d{14}$/.test(f.fssai) ? "FSSAI licence is 14 digits." : null;
    if (s === "review" && f.phone_verified !== digits10(f.phone)) return "Your mobile number changed: confirm it with the code first (tap Edit on You, then Next).";
    if (s === "password") return !passwordOk(pw.password) ? "Password needs 8+ characters with a letter and a number." : pw.password !== pw.confirm ? "The two passwords don’t match." : null;
    return null;
  };

  const post = async (stage: "draft" | "submit") => {
    const { billing, call_time, ...fields } = f;
    const notes = [billing && `Bills today with: ${billing}`, call_time && `Best time to call: ${call_time}`].filter(Boolean).join(". ");
    const address = fullAddress(f);
    const r = await fetch(`${API}/partner-applications`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...fields, address, gstin: f.gstin.toUpperCase(), ...(notes ? { notes } : {}), stage, submit_key: key.current, ...(stage === "submit" ? { password: pw.password } : {}) }) }).catch(() => null);
    const body = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) throw new Error(body?.detail ?? "We couldn't reach OneLocal. Check your connection and try again.");
    return body as { reference: string | null; existing: boolean; status: string; login?: string; app_code?: boolean; blocked?: string };
  };

  // 0740: the SMS code that proves the number (the website's server talks to Supabase)
  const phoneCall = async (body: Record<string, string>) => {
    const r = await fetch(`${API}/partner-phone`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, phone: digits10(f.phone), submit_key: key.current }) }).catch(() => null);
    const j = r ? ((await r.json().catch(() => ({}))) as { sent?: boolean; verified?: boolean; other_email?: string; detail?: string }) : {};
    if (!r?.ok) throw new Error(j.detail ?? "We couldn't reach OneLocal. Check your connection and try again.");
    return j;
  };
  const sendCode = async () => {
    setError(null); setCode("");
    try { await phoneCall({ action: "send" }); setCodeSentTo(digits10(f.phone)); } catch (err) { setError((err as Error).message); }
  };

  const next = async () => {
    if (busy) return;
    const e = check(screen);
    if (e) { setError(e); say(screen === "password" && passwordOk(pw.password) && pw.password !== pw.confirm ? "passwordMismatch" : "error", "confused"); return; }
    if (screen === "review") {
      setBusy(true); say("submitting", "thinking");
      try { const r = await post("submit"); say("success", "celebrate"); react("celebrate", 7000); setPw({ password: "", confirm: "" }); setDone({ reference: r.reference, existing: r.existing, login: r.login, appCode: r.app_code, blocked: r.blocked }); try { localStorage.removeItem(STORAGE); } catch { /* ignore */ } }
      catch (err) { setError((err as Error).message); say("error", "sad"); }
      finally { setBusy(false); }
      return;
    }
    // The contact step is where the partner agrees to be contacted, so that is when the draft first reaches One Local.
    if (screen === "you") {
      setBusy(true); setSaved("saving");
      try { await post("draft"); setSaved("saved"); } catch (err) { setBusy(false); setSaved("idle"); setError((err as Error).message); say("error", "sad"); return; }
      // a number not proven yet gets its code now, on the way to the code step
      if (f.phone_verified !== digits10(f.phone) && codeSentTo !== digits10(f.phone)) {
        try { await phoneCall({ action: "send" }); setCodeSentTo(digits10(f.phone)); setCode(""); }
        catch (err) { setBusy(false); setError((err as Error).message); say("error", "sad"); return; }
      }
      setBusy(false);
    }
    if (screen === "verify" && f.phone_verified !== digits10(f.phone)) {
      setBusy(true);
      try {
        const r = await phoneCall({ action: "verify", code, email: f.email.trim().toLowerCase() });
        if (r.other_email) {
          setBusy(false);
          setError(`This number already has a OneLocal login with ${r.other_email}. Go back and use that email, or use another number.`);
          say("error", "confused"); return;
        }
        set("phone_verified", digits10(f.phone)); setCode("");
      } catch (err) { setBusy(false); setError((err as Error).message); say("error", "sad"); return; }
      setBusy(false);
    }
    if (screen === "you") say("draftSaved", "excited"); else if (flow[index + 1] === "review") say("review", "proud"); else say("next", "excited");
    go(flow[index + 1], 1);
  };
  const jump = (s: Screen) => { if (s !== screen) go(s, flow.indexOf(s) < index ? -1 : 1); };
  const pickType = (t: PartnerType) => { if (t === f.partner_type) return; say(`type.${t}`, "excited"); setF(p => ({ ...p, partner_type: t, category_family: "", category: "", categories: [], subcategories: [] })); setError(null); };
  const pickFamily = (v: string) => { say(`family.${v}`, "excited"); setF(p => p.category_family === v ? p : ({ ...p, category_family: v, category: "", categories: [], subcategories: [] })); setError(null); };
  // Categories are multiple-choice. The first pick is the primary category; unticking one also unticks the items
  // that only it offered.
  const pickCategory = (v: string) => {
    const adding = !f.categories.includes(v);
    if (adding) say("category", "happy", { name: v }); else react("curious", 800);
    setF(p => {
      const cats = p.categories.includes(v) ? p.categories.filter(x => x !== v) : [...p.categories, v];
      const allowed = new Set(catList.filter(c => cats.includes(c.name)).flatMap(c => c.subcategories));
      return { ...p, categories: cats, category: cats[0] ?? "", subcategories: p.subcategories.filter(x => allowed.has(x)) };
    });
    setError(null);
  };
  const toggle = (v: string) => { const adding = !f.subcategories.includes(v); if (adding) say(f.partner_type === "restaurant" ? "restaurantType" : "subcat", "happy", { name: v }); else react("curious", 800); setF(p => ({ ...p, subcategories: p.subcategories.includes(v) ? p.subcategories.filter(x => x !== v) : [...p.subcategories, v] })); setError(null); };

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { x: d * 36, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE } },
    exit: (d: number) => (reduce ? { opacity: 0 } : { x: d * -36, opacity: 0, transition: { duration: 0.18 } }),
  };
  const backClass = "ol-bar-btn active:scale-95";

  return (
    <div data-onboarding className={`ol-landing ${fonts} relative min-h-dvh`}>
      <MascotFollower />
      <ContourField mood="cream" still className="fixed inset-0 size-full" />
      <div className="relative flex min-h-dvh flex-col">
        <header data-tone="forest" className="sticky top-3 z-30 px-3">
          <div className="ol-glass ol-bar mx-auto flex h-12 max-w-5xl items-center gap-2 rounded-full pr-2 pl-1.5">
            {index === 0 || done
              ? <Link href="/" aria-label="Back to home" className={backClass}><ChevronLeft className="size-5" /></Link>
              : <button type="button" onClick={back} aria-label="Back to the previous step" className={backClass}><ChevronLeft className="size-5" /></button>}
            <Link href="/" aria-label="OneLocal partners home" className="shrink-0 max-sm:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/onelocal-logo-on-dark.png" alt="OneLocal" className="h-5 w-auto" />
            </Link>
            {done ? <span className="flex-1" /> : (
              <div className="mx-2 flex min-w-0 flex-1 items-center gap-3" role="progressbar" aria-label="Application progress" aria-valuemin={1} aria-valuemax={flow.length} aria-valuenow={index + 1}>
                <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--chip)" }}>
                  <div className="h-full rounded-full bg-(--lime) transition-[width] duration-500 ease-out" style={{ width: `${((index + 1) / flow.length) * 100}%` }} />
                </div>
                <span className="shrink-0 text-xs font-bold tabular-nums">{index + 1} / {flow.length}</span>
              </div>
            )}
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-bold" title={saved === "saved" ? "Draft saved" : "Saves as you go"}>
              <span className={cn("size-2 rounded-full", saved === "saving" ? "animate-pulse bg-(--lime)" : saved === "saved" ? "bg-(--lime)" : "bg-current opacity-30")} />
              <span className="max-md:hidden">{saved === "saving" ? "Saving…" : saved === "saved" ? "Draft saved" : ""}</span>
            </span>
            <LangToggle />
            {/* Ol's spot on phones and tablets (the storefront is hidden there). */}
            <span data-mascot-home aria-hidden className="size-9 shrink-0 lg:hidden" />
          </div>
        </header>

        <main className="ol-form-main mx-auto grid w-full max-w-6xl flex-1 gap-x-12 px-5 pt-14 pb-10 md:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:px-10 lg:pt-10">
          <div className="min-w-0">
            {done ? <Done reference={done.reference} existing={done.existing} business={f.business_name} email={f.email} login={done.login} appCode={done.appCode} blocked={done.blocked} /> : (
              <form noValidate onSubmit={e => { e.preventDefault(); void next(); }} className="max-w-xl">
                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.section key={screen} custom={dir} variants={variants} initial="enter" animate="center" exit="exit">
                    {screen === "name" && <Name f={f} set={set} />}
                    {screen === "type" && <Type value={f.partner_type} onPick={pickType} />}
                    {screen === "you" && <You f={f} set={set} />}
                    {screen === "verify" && <Verify phone={digits10(f.phone)} verified={f.phone_verified === digits10(f.phone)} code={code} setCode={v => { setCode(v); setError(null); }} onResend={sendCode} />}
                    {screen === "family" && <Family value={f.category_family} onPick={pickFamily} />}
                    {screen === "category" && <WhatYouSell f={f} onCategory={pickCategory} onToggle={toggle} />}
                    {screen === "rtypes" && <RestaurantTypes values={f.subcategories} onToggle={toggle} />}
                    {screen === "where" && <Where f={f} set={set} />}
                    {screen === "delivery" && <Delivery f={f} set={set} />}
                    {screen === "papers" && <Papers f={f} set={set} />}
                    {screen === "call" && <Call f={f} set={set} />}
                    {screen === "password" && <Password email={f.email} pw={pw} setPw={setPw} />}
                    {screen === "review" && <Review f={f} goto={jump} />}
                  </motion.section>
                </AnimatePresence>
                <AnimatePresence>{error && <motion.p role="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, x: reduce ? 0 : [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }} className="ol-card is-error mt-6 w-fit px-4 py-2.5 text-[0.95rem] font-semibold">{error}</motion.p>}</AnimatePresence>
                <button type="submit" disabled={busy} onMouseEnter={() => react("playful", 900)} className="ol-pill mt-7 min-w-44">
                  {busy ? "Saving…" : screen === "review" ? "Send application" : "Next"}<ArrowRight className="size-5" aria-hidden />
                </button>
                {screen === "name" && <SignInOffer />}
              </form>
            )}
          </div>

          {/* The storefront for what is being chosen, with Ol beside it. Wide screens only. */}
          <aside className="relative hidden lg:block" aria-hidden>
            <AnimatePresence mode="wait">
              <motion.img key={hero} src={storeImg(hero)} alt="" className="mx-auto w-full max-w-[440px] object-contain drop-shadow-[0_34px_40px_rgba(6,24,10,0.4)]"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.5, ease: EASE }} />
            </AnimatePresence>
            <div data-mascot-home className="absolute -bottom-6 left-2 size-32" />
          </aside>
        </main>
      </div>
    </div>
  );
}

// The question, with a line of help under it.
function Q({ children, help }: { children: React.ReactNode; help?: React.ReactNode }) {
  return <>
    <h1 className="ol-title text-[clamp(2.1rem,4.6vw,3.4rem)]">{children}</h1>
    {help && <p className="ol-lead mt-4 max-w-lg text-lg">{help}</p>}
  </>;
}

// A labelled text box. While it has focus, a row opens under it exactly as tall as Ol and Ol's tip (the CSS variable
// --ol-row, set by MascotFollower), so Ol sits in that row and never covers the next box.
function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => row.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 220);
    return () => clearTimeout(t);
  }, [open]);
  const tipBox = (t: EventTarget | null) => t instanceof HTMLInputElement && !!t.dataset.olTip;
  return (
    <div onFocus={e => setOpen(tipBox(e.target))} onBlur={e => { if (!(e.currentTarget.contains(e.relatedTarget as Node | null) && tipBox(e.relatedTarget))) setOpen(false); }}>
      <label className="block"><span className="ol-label mb-2 block text-base">{label}{optional && <span className="font-normal"> (optional)</span>}</span>{children}</label>
      <div ref={row} aria-hidden className="scroll-mb-28 transition-[height] duration-200 ease-out motion-reduce:transition-none" style={{ height: open ? "var(--ol-row, 64px)" : 0 }} />
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { onValue: (v: string) => void; tip?: string }) {
  const { react } = useMascot();
  const { onValue, className, tip, ...rest } = props;
  return <input {...rest} data-ol-tip={tip} onFocus={() => react("listening", 1800)} onChange={e => { onValue(e.target.value); react("working", 900); }} className={cn("ol-field", className)} />;
}
// A tick box with its sentence, standing on the field.
function Tick({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-base">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="peer sr-only" />
      <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--forest)", checked ? "border-(--forest) bg-(--forest) text-(--lime)" : "border-(--field-line) bg-white")}>{checked && <Check className="size-4 text-(--ink)" strokeWidth={4} />}</span>
      <span>{children}</span>
    </label>
  );
}

function Name({ f, set }: { f: Form; set: Setter }) {
  return <>
    <Q help="The name on your board. Customers will see it in the One Local app.">What&apos;s your <em>business</em> called?</Q>
    <div className="mt-7"><Field label="Business name"><Input autoFocus value={f.business_name} tip="business_name" onValue={v => set("business_name", v)} placeholder="Your shop or brand name" autoComplete="organization" maxLength={80} /></Field></div>
  </>;
}

function Type({ value, onPick }: { value: PartnerType; onPick: (t: PartnerType) => void }) {
  return <>
    <Q help="This decides which Partner POS you get.">What kind of <em>business</em> is it?</Q>
    <div className="mt-7 grid gap-3.5" role="radiogroup" aria-label="Kind of business">
      {taxonomy.types.map(t => {
        const I = TYPE_ICONS[t.id as PartnerType];
        return (
          <button key={t.id} type="button" role="radio" aria-checked={value === t.id} onClick={() => onPick(t.id as PartnerType)} className="ol-choice">
            <span className="grid size-11 shrink-0 place-items-center rounded-[0.8rem] bg-(--forest) text-(--lime)"><I className="size-5" /></span>
            <span className="min-w-0"><span className="ol-display block text-xl leading-tight">{t.title}</span><span className="block text-sm text-(--soft)">{t.hint}</span></span>
          </button>
        );
      })}
    </div>
  </>;
}

function You({ f, set }: { f: Form; set: Setter }) {
  const { react } = useMascot();
  return <>
    <Q help="Our Latur team calls this number to verify your business. Your email becomes your login.">Who do we <em>call</em>?</Q>
    <div className="mt-7 grid gap-4">
      <Field label="Owner's full name"><Input value={f.owner_name} tip="owner_name" onValue={v => set("owner_name", v)} placeholder="Full name" autoComplete="name" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mobile number">
          <span className="relative block">
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[1.0625rem]">+91</span>
            <Input value={f.phone} tip="phone" onValue={v => set("phone", v)} placeholder="10-digit number" inputMode="tel" autoComplete="tel-national" aria-label="Mobile number, India +91" style={{ paddingLeft: "3.5rem" }} />
          </span>
        </Field>
        <Field label="Email"><Input value={f.email} tip="email" onValue={v => set("email", v)} placeholder="you@business.com" type="email" autoComplete="email" /></Field>
      </div>
      <Tick checked={f.consent} onChange={v => { set("consent", v); if (v) react("happy", 1200); }}>Save my application and let One Local contact me about joining. My details are used only for onboarding.</Tick>
    </div>
  </>;
}

// 0740: the SMS code that proves the mobile number, so the partner can later sign in with it.
function Verify({ phone, verified, code, setCode, onResend }: { phone: string; verified: boolean; code: string; setCode: (v: string) => void; onResend: () => Promise<void> }) {
  const [wait, setWait] = useState(30);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait(w => w - 1), 1000); return () => clearTimeout(t); }, [wait]);
  const masked = `+91 ${phone.slice(0, 2)}xxxxxx${phone.slice(-2)}`;
  if (verified) return <>
    <Q help="You can sign in with this number or your email later.">Number <em>confirmed</em></Q>
    <p className="ol-card mt-7 flex w-fit items-center gap-2 px-4 py-3 text-[0.95rem] font-semibold"><Check className="size-5 text-(--leaf)" strokeWidth={3} />{masked}</p>
  </>;
  return <>
    <Q help={<>We sent a 6-digit code to <b>{masked}</b>. It proves the number is yours, so you can sign in with it later.</>}>Type the <em>code</em></Q>
    <div className="mt-7 max-w-xs">
      <Field label="Code from the SMS">
        <Input autoFocus value={code} tip="otp" onValue={v => setCode(v.replace(/\D/g, "").slice(0, 6))} placeholder="••••••" inputMode="numeric" autoComplete="one-time-code"
          className="text-center font-mono text-xl tracking-[0.5em] indent-[0.5em] tabular-nums" maxLength={6} />
      </Field>
    </div>
    <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.95rem]">
      <button type="button" disabled={wait > 0} onClick={() => { setWait(30); void onResend(); }} className="font-semibold underline underline-offset-4 disabled:text-(--soft) disabled:no-underline">
        {wait > 0 ? `Send again in ${wait}s` : "Send the code again"}
      </button>
      <span className="text-(--soft)">Wrong number? Go back one step to change it.</span>
    </div>
  </>;
}

function Family({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  return <>
    <Q>Which is <em>closer</em> to your shop?</Q>
    <div className="mt-7 grid gap-3.5" role="radiogroup" aria-label="Shop type">
      {taxonomy.store.families.map(x => (
        <button key={x.name} type="button" role="radio" aria-checked={value === x.name} onClick={() => onPick(x.name)} className="ol-choice">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon(x.icon)} alt="" className="size-14 shrink-0 rounded-2xl object-cover" />
          <span className="min-w-0"><span className="ol-display block text-xl leading-tight">{x.name}</span><span className="block text-sm text-(--soft)">{x.hint}</span></span>
        </button>
      ))}
    </div>
  </>;
}

// One tile in a grid of choices (category, food type).
function Tile({ name, slug, Icon, on, onClick }: { name: string; slug?: string; Icon?: LucideIcon; on: boolean; onClick: () => void }) {
  const { react } = useMascot();
  return (
    <button type="button" role="checkbox" aria-checked={on} onClick={onClick} onMouseEnter={() => react("curious", 700)} className="ol-choice min-h-[64px] !gap-2.5 !p-2">
      {Icon ? <span className="ol-ico !size-10 !rounded-xl"><Icon className="size-5" strokeWidth={1.9} aria-hidden /></span>
        // eslint-disable-next-line @next/next/no-img-element
        : <img src={icon(slug ?? "")} alt="" className="size-10 shrink-0 rounded-xl object-cover" />}
      <span className="min-w-0 flex-1 text-[0.92rem] leading-tight font-bold">{name}</span>
      {on && <Check className="mr-1 size-5 shrink-0" strokeWidth={3.5} />}
    </button>
  );
}
function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return <button type="button" role="checkbox" aria-checked={on} onClick={onClick} className="ol-chip">{on && <Check className="size-4" strokeWidth={3.5} />}{label}</button>;
}

// Categories first; the things sold in each appear under the grid once a category is picked.
function WhatYouSell({ f, onCategory, onToggle }: { f: Form; onCategory: (v: string) => void; onToggle: (v: string) => void }) {
  const store = f.partner_type === "store";
  const family = taxonomy.store.families.find(x => x.name === f.category_family);
  const cats = store ? family?.categories ?? [] : taxonomy.service.categories;
  // Picked categories in pick order; each gets its own list of items below the grid.
  const picked = f.categories.map(n => cats.find(c => c.name === n)).filter((c): c is (typeof cats)[number] => !!c);
  const last = picked[picked.length - 1]?.name;
  const items = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!last) return;
    const t = setTimeout(() => items.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 200);
    return () => clearTimeout(t);
  }, [last]);
  return <>
    <Q help={store ? "Pick one or more, then tick what you sell in each." : "Pick one or more, then tick the services you offer."}>{store ? <>What do you <em>sell</em>?</> : <>What do you <em>offer</em>?</>}</Q>
    <div role="group" aria-label="Categories" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cats.map(c => <Tile key={c.name} name={c.name} slug={c.icon} on={f.categories.includes(c.name)} onClick={() => onCategory(c.name)} />)}
    </div>
    <AnimatePresence initial={false}>
      {picked.map(cat => (
        <motion.div ref={cat.name === last ? items : undefined} key={cat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-6 scroll-mb-28">
          <p className="ol-label mb-3 flex items-baseline justify-between gap-3 text-base"><span>{store ? `In ${cat.name}, you sell…` : `In ${cat.name}, you offer…`}</span><span className="shrink-0 tabular-nums">{cat.subcategories.filter(x => f.subcategories.includes(x)).length} picked</span></p>
          <div className="flex flex-wrap gap-2.5">{cat.subcategories.map(s => <Chip key={s} label={s} on={f.subcategories.includes(s)} onClick={() => onToggle(s)} />)}</div>
        </motion.div>
      ))}
    </AnimatePresence>
  </>;
}

function RestaurantTypes({ values, onToggle }: { values: string[]; onToggle: (v: string) => void }) {
  return <>
    <Q help="Tick every cuisine on your menu. The first one you tick is your main one.">What do you <em>serve</em>?</Q>
    <div role="group" aria-label="Food types" className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {taxonomy.restaurant.types.map(r => <Tile key={r.name} name={r.name} Icon={CUISINE_ICONS[r.icon] ?? Utensils} on={values.includes(r.name)} onClick={() => onToggle(r.name)} />)}
    </div>
  </>;
}

function Where({ f, set }: { f: Form; set: Setter }) {
  const pin = f.location_lat != null && f.location_lng != null ? { lat: f.location_lat, lng: f.location_lng } : null;
  return <>
    <Q help="Riders use the pin to reach you, and customers nearby find you by it.">Where is your <em>shop</em>?</Q>
    <MapPin value={pin} onPin={(p, found) => {
      set("location_lat", p.lat); set("location_lng", p.lng);
      // the pin decides the street / area and the PIN: every move fills them again (the partner can still correct them after);
      // shop no. and landmark are the partner's own and are never touched
      if (found?.pin_code) set("pin_code", found.pin_code);
      if (found?.locality) set("locality", found.locality);
    }} />
    <p className="ol-label mt-8 mb-3 text-base">Address details</p>
    <div className="grid gap-4">
      <Field label="Shop no., building and floor"><Input value={f.address_line} tip="address_line" onValue={v => set("address_line", v)} placeholder="e.g. Shop 4, Sai Complex, ground floor" autoComplete="address-line1" maxLength={200} /></Field>
      <Field label="Street and area"><Input value={f.locality} tip="locality" onValue={v => set("locality", v)} placeholder="e.g. Ausa Road, Shivaji Nagar" autoComplete="address-line2" maxLength={100} /></Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_170px]">
        <Field label="Landmark" optional><Input value={f.landmark} tip="landmark" onValue={v => set("landmark", v)} placeholder="e.g. opposite the bus stand" maxLength={100} /></Field>
        <Field label="PIN code"><Input value={f.pin_code} tip="pin_code" onValue={v => set("pin_code", v.replace(/\D/g, "").slice(0, 6))} placeholder="413512" inputMode="numeric" autoComplete="postal-code" /></Field>
      </div>
      <p className="text-sm text-(--soft)">City: <b className="text-(--fg)">Latur, Maharashtra</b>. One Local is open in Latur for now.</p>
    </div>
  </>;
}

function Delivery({ f, set }: { f: Form; set: Setter }) {
  const { react } = useMascot();
  const services = [{ id: "delivery", label: "Home delivery" }, { id: "pickup", label: "Pickup from the shop" }, ...(f.partner_type === "restaurant" ? [{ id: "dine_in", label: "Dine-in" }] : [])];
  return <>
    <Q help="Tick all that apply.">How do orders reach your <em>customers</em>?</Q>
    <div className="mt-7 flex flex-wrap gap-3" role="group" aria-label="How orders reach customers">
      {services.map(s => { const on = f.services.includes(s.id); return <button key={s.id} type="button" role="checkbox" aria-checked={on} onClick={() => { set("services", on ? f.services.filter(x => x !== s.id) : [...f.services, s.id]); react("happy", 900); }} className="ol-chip !px-5 !py-2.5 !text-base">{on && <Check className="size-4" strokeWidth={3.5} />}{s.label}</button>; })}
    </div>
    <div className="mt-7"><Tick checked={f.own_delivery} onChange={v => set("own_delivery", v)}>I have my own delivery staff. (You can still use One Local riders.)</Tick></div>
  </>;
}

function Papers({ f, set }: { f: Form; set: Setter }) {
  const food = f.partner_type === "restaurant" || f.category_family === "Grocery and daily needs";
  return <>
    <Q help="Fill what you have now. Our team collects the rest when they call.">Any of these <em>handy</em>?</Q>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <Field label="GSTIN" optional><Input value={f.gstin} tip="gstin" onValue={v => set("gstin", v.toUpperCase())} placeholder="27ABCDE1234F1Z5" maxLength={15} /></Field>
      {food && <Field label="FSSAI licence" optional><Input value={f.fssai} tip="fssai" onValue={v => set("fssai", v.replace(/\D/g, "").slice(0, 14))} placeholder="14 digits" inputMode="numeric" /></Field>}
      <Field label="How many outlets?"><Input value={f.outlets} tip="outlets" onValue={v => set("outlets", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" /></Field>
    </div>
  </>;
}

// Two taps that help the team's first call. Both are optional.
function Call({ f, set }: { f: Form; set: Setter }) {
  const pick = (k: "billing" | "call_time", v: string) => set(k, f[k] === v ? "" : v);
  return <>
    <Q help="Two quick taps, so our first call is useful to you.">Before we <em>call</em> you</Q>
    <p className="ol-label mt-7 mb-3 text-base">How do you bill today?</p>
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="How you bill today">
      {BILLING.map(b => <button key={b} type="button" role="radio" aria-checked={f.billing === b} onClick={() => pick("billing", b)} className="ol-chip">{b}</button>)}
    </div>
    <p className="ol-label mt-6 mb-3 text-base">When is a good time to call?</p>
    <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Best time to call">
      {CALL_TIMES.map(c => <button key={c} type="button" role="radio" aria-checked={f.call_time === c} onClick={() => pick("call_time", c)} className="ol-chip">{c}</button>)}
    </div>
    <div className="mt-7"><Tick checked={f.whatsapp_ok} onChange={v => set("whatsapp_ok", v)}>Send me updates on WhatsApp.</Tick></div>
  </>;
}

function Password({ email, pw, setPw }: { email: string; pw: { password: string; confirm: string }; setPw: (p: { password: string; confirm: string }) => void }) {
  const { say } = useMascot();
  const [show, setShow] = useState(false);
  const score = [pw.password.length >= 8, /[A-Za-z]/.test(pw.password), /\d/.test(pw.password), /[^A-Za-z0-9]/.test(pw.password) || pw.password.length >= 12].filter(Boolean).length;
  const strong = score >= 3 && pw.password.length >= 8;
  const was = useRef(false);
  useEffect(() => { if (!pw.password) return; if (strong !== was.current) { was.current = strong; say(strong ? "passwordStrong" : "passwordWeak", strong ? "proud" : undefined); } }, [strong, pw.password, say]);
  const label = ["Too short", "Weak", "Okay", "Strong", "Very strong"][score];
  return <>
    <Q help={<>You will sign in to the One Local Partner app with <span className="break-all">{email}</span> and this password, once your shop is approved.</>}>Pick a <em>password</em></Q>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <Field label="Password">
        <div className="relative"><Input type={show ? "text" : "password"} tip="password" value={pw.password} onValue={v => setPw({ ...pw, password: v })} placeholder="8+ characters, with a number" autoComplete="new-password" className="pr-20" />
          <button type="button" onClick={() => setShow(x => !x)} className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-bold text-(--ink)">{show ? "Hide" : "Show"}</button></div>
      </Field>
      <Field label="Type it again"><Input type={show ? "text" : "password"} tip="password_confirm" value={pw.confirm} onValue={v => setPw({ ...pw, confirm: v })} placeholder="Same password" autoComplete="new-password" /></Field>
    </div>
    <div className="mt-5 flex max-w-md items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5">{[0, 1, 2, 3].map(i => <span key={i} className="h-2 flex-1 rounded-full transition-colors duration-300" style={{ background: i < score ? (score >= 3 ? "var(--leaf)" : score === 2 ? "oklch(0.7 0.13 70)" : "var(--danger)") : "var(--line)" }} />)}</div>
      {pw.password && <span className="ol-lead w-24 text-right text-sm">{label}</span>}
    </div>
    <p className="ol-lead mt-4 max-w-md text-sm">Never share your password, not even with the One Local team. We will never ask for it.</p>
  </>;
}

// Everything in one look before sending, each part with its own Edit.
function Review({ f, goto }: { f: Form; goto: (s: Screen) => void }) {
  const type = taxonomy.types.find(t => t.id === f.partner_type)?.title ?? "";
  const what: { title: string; screen: Screen; rows: [string, string][] } =
    f.partner_type === "store" ? { title: "What you sell", screen: "category", rows: [["Shop type", f.category_family], ["Categories", f.categories.join(", ")], ["Sells", f.subcategories.join(", ")]] }
    : f.partner_type === "service" ? { title: "Your services", screen: "category", rows: [["Categories", f.categories.join(", ")], ["Services", f.subcategories.join(", ")]] }
    : { title: "Food you serve", screen: "rtypes", rows: [["Food", f.subcategories.join(", ")]] };
  const where: [string, string][] = [["Address", `${fullAddress(f)} ${f.pin_code}`], ["Map pin", f.location_lat != null ? "Pinned" : "Not pinned"], ["Outlets", f.outlets || "1"], ...(f.gstin ? [["GSTIN", f.gstin] as [string, string]] : []), ...(f.fssai ? [["FSSAI", f.fssai] as [string, string]] : [])];
  return <>
    <Q help="Tap Edit to change anything.">All <em>good</em>?</Q>
    <div className="mt-7 grid gap-4">
      <Summary title="You" onEdit={() => goto("you")} rows={[["Business", f.business_name], ["Kind", type], ["Owner", f.owner_name], ["Mobile", f.phone], ["Email", f.email]]} />
      <Summary title={what.title} onEdit={() => goto(what.screen)} rows={what.rows} />
      <Summary title="Where" onEdit={() => goto("where")} rows={where} />
    </div>
  </>;
}
function Summary({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <section className="ol-card px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="ol-display text-lg">{title}</h2>
        <button type="button" onClick={onEdit} className="flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-bold underline underline-offset-4"><Pencil className="size-3.5" />Edit<span className="sr-only"> {title}</span></button>
      </div>
      <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-(--soft)">{k}</dt><dd className="text-[0.95rem] font-semibold break-words">{v || "—"}</dd></div>)}
      </dl>
    </section>
  );
}

// Copies the application reference; falls back to a hidden text box where the clipboard API is blocked (plain http on a phone).
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return <button type="button" onClick={copy} aria-pressed={copied} aria-label={copied ? "Reference copied" : "Copy reference"} className="ol-chip mt-3">{copied ? <Check className="size-4" strokeWidth={3.5} /> : <Copy className="size-4" />}{copied ? "Copied" : "Copy"}</button>;
}

// On the first step: partners who already applied (or are approved) go straight to their dashboard and sign in there.
function SignInOffer() {
  return (
    <div className="mt-12 flex max-w-lg flex-wrap items-center gap-x-4 gap-y-3 border-t border-(--line) pt-6">
      <span className="ol-ico grid size-11 shrink-0 place-items-center rounded-[0.8rem]"><LayoutDashboard className="size-5" aria-hidden /></span>
      <div className="min-w-0 flex-1">
        <p className="ol-label text-base">Already a OneLocal partner?</p>
        <p className="ol-lead text-[0.95rem]">Sign in with the email and password from your application.</p>
      </div>
      <Link href="/dashboard" className="ol-pill is-quiet !min-h-11 !px-5">Sign in<ArrowRight className="size-4" aria-hidden /></Link>
    </div>
  );
}

// After sending: the application's code, how to sign in, and what happens next, in that order.
// Why the server could not make the store yet, if it could not (database 0737).
const BLOCKED: Record<string, string> = {
  phone_in_use: "This mobile number is already registered with another OneLocal business, so we could not set up your store yet. Our team will call you to sort it out.",
  email_in_use: "This email is already registered with another OneLocal business, so we could not set up your store yet. Our team will call you to sort it out.",
  email_not_confirmed: "Confirm your email first (we sent you a link). Your store is set up once it is confirmed.",
  store_not_created: "We could not set up your store just now. Our team will set it up when they call you.",
};

function Done({ reference, existing, business, email, login, appCode, blocked }: { reference: string | null; existing: boolean; business: string; email: string; login?: string; appCode?: boolean; blocked?: string }) {
  const loginLine = appCode || login === "created" ? <>Sign in with <b className="break-all">{email}</b> and the password you just set.</>
    : login === "exists" ? <>This email already had a OneLocal login, so your store uses it. Sign in with that login: its password, or Google in the Partner app.</>
    : login === "confirm_email" ? <>First confirm your email: we sent a link to <b className="break-all">{email}</b>.</>
    : login === "failed" ? <>We could not set up your login just now. Our team will help you with it on the call.</>
    : <>Sign in with <b className="break-all">{email}</b> and your password.</>;
  const canSignIn = login !== "failed" && login !== "confirm_email";
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="max-w-xl">
      <span className="grid size-12 place-items-center rounded-full bg-(--forest) text-(--lime)"><Check className="size-6" strokeWidth={3} aria-hidden /></span>
      <h1 className="ol-title mt-5 text-[clamp(2rem,4.4vw,3.1rem)] text-balance">
        {existing ? <>We already have <em>your application</em></> : <>Application <em>sent</em></>}
      </h1>
      <p className="ol-lead mt-3 max-w-[34rem] text-lg text-pretty">
        {existing ? <>Thank you, {business}. It is with our Latur team, who review every application.</>
          : <>Thank you, {business}. Our Latur team reviews every application and will call you to verify your details.</>}
      </p>
      {blocked && BLOCKED[blocked] && <p role="status" className="ol-card mt-6 px-5 py-4 text-[0.95rem] font-semibold">{BLOCKED[blocked]}</p>}

      {reference ? (
        <section className="ol-card mt-8 overflow-hidden" aria-label="Your application code">
          <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5 pb-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-(--soft)">{appCode ? "Your app code" : "Your application code"}</p>
              <p className="mt-1 font-mono text-[clamp(1.6rem,5vw,2rem)] leading-none font-bold tracking-[0.08em] tabular-nums">{reference}</p>
            </div>
            <CopyButton text={reference} />
          </div>
          <p className="border-t border-(--line) bg-(--cream-2) px-5 py-3 text-[0.95rem] sm:px-6">Keep this code. Our team asks for it on the call{appCode ? ", and it also signs you in to the Partner app" : ""}.</p>
        </section>
      ) : (
        <p className="ol-card mt-8 px-5 py-4 text-[0.95rem]">For your safety we do not show the code of an application we already have. Our Latur team will call you on the number you gave.</p>
      )}

      <h2 className="ol-display mt-10 text-xl">What happens next</h2>
      <ol className="mt-4 grid gap-5">
        {[
          { icon: Phone, head: "We call you", body: "Our Latur team calls to verify your business and answer your questions." },
          { icon: LayoutDashboard, head: "Finish your details on the dashboard", body: <>Add your PAN, bank account and documents, and set up your catalogue. {loginLine}</> },
          { icon: Store, head: "Go live", body: "Once approved, you take orders and bookings on OneLocal and bill at the counter." },
        ].map(({ icon: I, head, body }, i) => (
          <li key={head} className="grid grid-cols-[2.75rem_1fr] gap-x-4">
            <span className={cn("grid size-11 place-items-center rounded-[0.8rem]", i === 0 ? "bg-(--forest) text-(--lime)" : "ol-ico")}><I className="size-5" aria-hidden /></span>
            <div className="pt-0.5"><p className="ol-label text-[1.05rem]">{head}</p><p className="ol-lead mt-0.5 text-[0.95rem] text-pretty">{body}</p></div>
          </li>
        ))}
      </ol>

      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
        {canSignIn && <Link href="/dashboard" className="ol-pill">Open my dashboard<ArrowRight className="size-5" aria-hidden /></Link>}
        <Link href="/" className="ol-label text-base underline underline-offset-4">Back to home</Link>
      </div>
    </motion.div>
  );
}

// Which language Ol speaks: English, Hinglish or Hindi. Remembered on this browser.
function LangToggle() {
  const { lang, setLang, say } = useMascot();
  return <div role="radiogroup" aria-label="Ol’s language" className="flex shrink-0 text-xs font-bold">
    {([["en", "English", "EN"], ["hi", "हिन्दी", "हिंदी"], ["hinglish", "Hinglish", "Hinglish"]] as const).map(([v, t, short]) => <button key={v} type="button" role="radio" aria-checked={lang === v} aria-label={t}
      onClick={() => { setLang(v); setTimeout(() => say("welcome", "happy"), 60); }}
      className="rounded-full px-2 py-1 transition-colors" style={lang === v ? { background: "var(--chip-on)", color: "var(--chip-on-text)" } : { color: "var(--soft)" }}>{short}</button>)}
  </div>;
}
