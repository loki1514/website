"use client";

// Partner onboarding, built from the founder's screens (partner-website/landing page/*.pdf, 10 Oct 2026):
// a dark left panel with the 3D storefront for whatever the partner picks, and a light right panel with the steps.
// Shortened after the founder's walkthrough (11 Oct 2026, "the entire flow is a bit long, no back button"):
//   Basics → What you sell (type, category and items on one screen) → Address → Login & submit (password + review).
// Back is always on screen (the first step's Back goes home), every step is a browser history entry so the phone's
// back gesture moves between steps, and finished steps in the stepper can be clicked to jump back.
// The draft is saved to OneLocal after the first screen; the form also survives a reload on this browser. Ol, the
// mascot, reacts to everything and hops under whichever text box you are typing in.
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Pencil, Store, Truck, UtensilsCrossed, Wrench } from "lucide-react";
import taxonomy from "@/lib/partner-taxonomy.json";
import { API } from "@/lib/partners";
import { MascotFollower, useMascot } from "@/components/mascot";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, randomKey } from "@/lib/utils";

type PartnerType = "store" | "restaurant" | "service" | "logistic";
type Form = {
  partner_type: PartnerType; business_name: string; owner_name: string; phone: string; email: string; consent: boolean;
  category_family: string; category: string; subcategories: string[];
  address: string; pin_code: string; outlets: string; gstin: string; fssai: string; services: string[]; own_delivery: boolean; whatsapp_ok: boolean;
};
const EMPTY: Form = { partner_type: "store", business_name: "", owner_name: "", phone: "", email: "", consent: false, category_family: "", category: "", subcategories: [], address: "", pin_code: "", outlets: "1", gstin: "", fssai: "", services: ["delivery"], own_delivery: false, whatsapp_ok: true };
type Screen = "start" | "category" | "rtypes" | "business" | "finish";
// Drafts saved on this browser before the flow was shortened point at screens that are now merged.
const OLD_SCREENS: Record<string, Screen> = { family: "category", subcats: "category", account: "finish", review: "finish" };
const STORAGE = "onelocal.partner-onboarding.v1";
const TYPE_ICONS = { store: Store, restaurant: UtensilsCrossed, service: Wrench, logistic: Truck } as const;
const icon = (slug: string) => `/onboarding/icons/${slug}.webp`;
const storeImg = (slug?: string | null) => `/onboarding/stores/${slug ?? "default-shop"}.webp`;
const H2 = "text-[26px] leading-tight font-extrabold tracking-tight sm:text-[30px]";

const phoneOk = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").replace(/^(91|0)(?=[6-9]\d{9}$)/, ""));
const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());
const passwordOk = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

function screensFor(t: PartnerType): Screen[] {
  if (t === "store" || t === "service") return ["start", "category", "business", "finish"];
  if (t === "restaurant") return ["start", "rtypes", "business", "finish"];
  return ["start", "business", "finish"];
}
function stepLabel(s: Screen, t: PartnerType) {
  if (s === "start") return "Basics";
  if (s === "category") return t === "service" ? "Your services" : "What you sell";
  if (s === "rtypes") return "Food you serve";
  if (s === "business") return "Address";
  return "Login & submit";
}

export function Onboarding() {
  const reduce = useReducedMotion();
  const { react, say } = useMascot();
  const [f, setF] = useState<Form>(EMPTY);
  // The password lives only in memory: never in the saved draft, never in the server's draft.
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [screen, setScreen] = useState<Screen>("start");
  const [dir, setDir] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; existing: boolean; login?: string } | null>(null);
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
    let first: Screen = "start";
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) {
        const s = JSON.parse(raw);
        const form: Form = { ...EMPTY, ...s.f };
        const want = OLD_SCREENS[s.screen] ?? s.screen;
        first = screensFor(form.partner_type).includes(want) ? want : "start";
        setF(form); setScreen(first); key.current = s.key;
      }
    } catch { /* storage blocked */ }
    if (!key.current) key.current = randomKey();
    trail.current = [first];
    history.replaceState({ ...history.state, olStep: first, olDepth: 0 }, "");
  }, []);
  useEffect(() => { try { if (!done) localStorage.setItem(STORAGE, JSON.stringify({ f, screen, key: key.current })); } catch { /* ignore */ } }, [f, screen, done]);
  // Each step starts at the top (a short laptop screen used to open the next step half-way down), and the text box
  // you were in lets go of focus so Ol goes home instead of staying under a box that is leaving.
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

  const set = useCallback(<K extends keyof Form>(k: K, v: Form[K]) => { setF(p => ({ ...p, [k]: v })); setError(null); }, []);
  const family = taxonomy.store.families.find(x => x.name === f.category_family);
  const categories = f.partner_type === "store" ? family?.categories ?? [] : taxonomy.service.categories;
  const category = categories.find(c => c.name === f.category);
  const hero = (f.partner_type === "store" || f.partner_type === "service") ? category?.store ?? null : null;

  const check = (s: Screen): string | null => {
    if (s === "start") return f.business_name.trim().length < 2 ? "Enter your business name." : f.owner_name.trim().length < 2 ? "Enter the owner's full name." : !phoneOk(f.phone) ? "Enter a 10-digit mobile number." : !emailOk(f.email) ? "Enter a valid email." : !f.consent ? "Please agree so we can save your draft." : null;
    if (s === "category") return f.partner_type === "store" && !f.category_family ? "Choose Shops or Grocery first." : !f.category ? "Choose a category." : !f.subcategories.length ? (f.partner_type === "service" ? "Tick at least one service you offer." : "Tick at least one thing you sell.") : null;
    if (s === "rtypes") return f.subcategories.length ? null : "Pick at least one type of food.";
    if (s === "business") return f.address.trim().length < 5 ? "Enter your shop address." : !/^[1-9]\d{5}$/.test(f.pin_code) ? "PIN code must be 6 digits." : f.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(f.gstin.toUpperCase()) ? "GSTIN looks wrong (15 characters)." : f.fssai && !/^\d{14}$/.test(f.fssai) ? "FSSAI licence is 14 digits." : null;
    if (s === "finish") return !passwordOk(pw.password) ? "Password needs 8+ characters with a letter and a number." : pw.password !== pw.confirm ? "The two passwords don’t match." : null;
    return null;
  };

  const post = async (stage: "draft" | "submit") => {
    const r = await fetch(`${API}/partner-applications`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...f, gstin: f.gstin.toUpperCase(), stage, submit_key: key.current, ...(stage === "submit" ? { password: pw.password } : {}) }) }).catch(() => null);
    const body = r ? await r.json().catch(() => ({})) : {};
    if (!r || !r.ok) throw new Error(body?.detail ?? "We couldn't reach OneLocal. Check your connection and try again.");
    return body as { reference: string; existing: boolean; status: string; login?: string };
  };

  const next = async () => {
    if (busy) return;
    const e = check(screen);
    if (e) { setError(e); say(screen === "finish" && passwordOk(pw.password) && pw.password !== pw.confirm ? "passwordMismatch" : "error", "confused"); return; }
    if (screen === "finish") {
      setBusy(true); say("submitting", "thinking");
      try { const r = await post("submit"); say("success", "celebrate"); react("celebrate", 7000); setPw({ password: "", confirm: "" }); setDone({ reference: r.reference, existing: r.existing, login: r.login }); try { localStorage.removeItem(STORAGE); } catch { /* ignore */ } }
      catch (err) { setError((err as Error).message); say("error", "sad"); }
      finally { setBusy(false); }
      return;
    }
    if (screen === "start") {
      setBusy(true); setSaved("saving");
      try { await post("draft"); setSaved("saved"); } catch (err) { setBusy(false); setSaved("idle"); setError((err as Error).message); say("error", "sad"); return; }
      setBusy(false);
    }
    if (screen === "start") say("draftSaved", "excited"); else if (index + 2 === flow.length) say("review", "proud"); else say("next", "excited");
    go(flow[index + 1], 1);
  };
  const jump = (s: Screen) => { if (s !== screen) go(s, flow.indexOf(s) < index ? -1 : 1); };
  const pickFamily = (v: string) => { say(`family.${v}`, "excited"); setF(p => ({ ...p, category_family: v, category: p.category_family === v ? p.category : "", subcategories: p.category_family === v ? p.subcategories : [] })); setError(null); };
  const pickCategory = (v: string) => { say("category", "happy", { name: v }); setF(p => ({ ...p, category: v, subcategories: p.category === v ? p.subcategories : [] })); setError(null); };
  const toggle = (v: string) => { const adding = !f.subcategories.includes(v); if (adding) say(f.partner_type === "restaurant" ? "restaurantType" : "subcat", "happy", { name: v }); else react("curious", 800); setF(p => ({ ...p, subcategories: p.subcategories.includes(v) ? p.subcategories.filter(x => x !== v) : [...p.subcategories, v] })); setError(null); };

  const variants = {
    enter: (d: number) => (reduce ? { opacity: 0 } : { x: d * 40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.23, 1, 0.32, 1] as const } },
    exit: (d: number) => (reduce ? { opacity: 0 } : { x: d * -40, opacity: 0, transition: { duration: 0.18 } }),
  };
  const backIcon = "grid size-9 shrink-0 place-items-center rounded-full text-[#2E3B33] transition hover:bg-black/5 active:scale-95";
  const backBtn = "flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[#4A5A50] transition hover:border-black/20 active:scale-95";

  return (
    <div data-onboarding className="grid min-h-dvh bg-[#F3F6F2] text-[#16201B] lg:grid-cols-[minmax(360px,460px)_1fr]">
      <MascotFollower />
      {/* Left: the storefront for what you are choosing. Stays in view while the steps scroll. */}
      <aside className="relative hidden overflow-hidden bg-[#1C2A1F] lg:sticky lg:top-0 lg:block lg:h-dvh lg:self-start">
        <Arcs />
        <div className="relative z-10 flex h-full flex-col p-10">
          <Link href="/" className="flex w-fit items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"><ChevronLeft className="size-4" />Home</Link>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold tracking-wide text-[#8CF52B]"><span className="size-2 rounded-full bg-[#8CF52B]" />ONELOCAL</p>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.img key={hero ?? "default"} src={storeImg(hero)} alt="" initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }} className="relative max-h-full w-[380px] max-w-full object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]" />
            </AnimatePresence>
            <div data-mascot-home aria-hidden className="absolute right-0 bottom-4 size-32" />
          </div>
          <p className="text-center text-sm text-white/55">Your business. Your neighbourhood. OneLocal.</p>
          <Link href="/source" className="mt-1 text-center text-[11px] text-white/35 hover:text-white/70">Source code (AGPL-3.0)</Link>
        </div>
      </aside>

      {/* Right: the steps. Header and footer stay put; the step scrolls between them. */}
      <main className="relative flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-[#F6F8F5] px-4 pt-3 pb-3 sm:px-10 sm:pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {index === 0 || done
                ? <Link href="/" aria-label="Back to home" className={backIcon}><ChevronLeft className="size-5" /></Link>
                : <button type="button" onClick={back} aria-label="Back to the previous step" className={backIcon}><ChevronLeft className="size-5" /></button>}
              <h1 className="truncate text-base font-bold sm:text-lg"><span className="sm:hidden">Join OneLocal</span><span className="hidden sm:inline">Partner Onboarding</span></h1>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
              <LangToggle />
              <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#8A9A90] uppercase" title={saved === "saved" ? "Draft saved" : "Auto-save"}>
                <span className={cn("size-1.5 rounded-full", saved === "saving" ? "animate-pulse bg-amber-400" : saved === "saved" ? "bg-[#3FAE49]" : "bg-[#B9C4BD]")} />
                <span className="hidden sm:inline">{saved === "saving" ? "Saving…" : saved === "saved" ? "Draft saved" : "Auto-save"}</span>
              </span>
              {/* Ol's spot on phones and tablets (the storefront panel is hidden there). */}
              <span data-mascot-home aria-hidden className="size-9 shrink-0 lg:hidden" />
            </div>
          </div>
          {!done && <Stepper flow={flow} index={index} type={f.partner_type} onJump={jump} />}
        </header>

        <div className="relative flex flex-1 justify-center overflow-clip px-4 py-6 sm:px-10 sm:py-8">
          <Arcs light />
          {done ? <div className="relative w-full max-w-[660px]"><Done reference={done.reference} existing={done.existing} business={f.business_name} email={f.email} login={done.login} /></div> : (
            <form id="onboarding" noValidate onSubmit={e => { e.preventDefault(); void next(); }} className="relative w-full max-w-[660px]">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.section key={screen} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" aria-label={stepLabel(screen, f.partner_type)}>
                  {screen === "start" && <Start f={f} set={set} />}
                  {screen === "category" && <WhatYouSell f={f} onFamily={pickFamily} onCategory={pickCategory} onToggle={toggle} />}
                  {screen === "rtypes" && <RestaurantTypes values={f.subcategories} onToggle={toggle} />}
                  {screen === "business" && <Business f={f} set={set} />}
                  {screen === "finish" && <Finish f={f} pw={pw} setPw={setPw} goto={jump} />}
                </motion.section>
              </AnimatePresence>
            </form>
          )}
        </div>

        {!done && (
          <footer className="sticky bottom-0 z-30 border-t border-black/5 bg-[#F3F6F2] px-4 py-3 sm:px-10">
            <div className="mx-auto max-w-[660px]">
              <AnimatePresence>{error && <motion.p role="alert" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0, x: reduce ? 0 : [0, -6, 6, -3, 0] }} exit={{ opacity: 0 }} className="mb-2.5 rounded-xl bg-red-50 px-3.5 py-2 text-sm font-medium text-red-700">{error}</motion.p>}</AnimatePresence>
              <div className="flex items-center justify-between gap-3">
                {index === 0
                  ? <Link href="/" className={backBtn}><ArrowLeft className="size-4" />Back</Link>
                  : <button type="button" onClick={back} className={backBtn}><ArrowLeft className="size-4" />Back</button>}
                <span className="hidden text-sm text-[#6B7A72] sm:block">Step {index + 1} of {flow.length}</span>
                <button type="submit" form="onboarding" disabled={busy} onMouseEnter={() => react("playful", 900)}
                  className="flex items-center gap-2 rounded-full bg-[#3FAE49] px-6 py-3 text-base font-bold text-white shadow-[0_10px_24px_rgba(63,174,73,0.35)] transition hover:-translate-y-0.5 hover:bg-[#379B41] active:scale-95 disabled:opacity-60 sm:px-7">
                  {busy ? "Saving…" : screen === "finish" ? "Submit application" : "Continue"}<ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

// Progress with the step names. Finished steps can be clicked to go back to them.
function Stepper({ flow, index, type, onJump }: { flow: Screen[]; index: number; type: PartnerType; onJump: (s: Screen) => void }) {
  return (
    <nav aria-label="Steps" className="mt-3">
      <ol className="flex gap-2">
        {flow.map((s, i) => {
          const finished = i < index, current = i === index;
          return (
            <li key={s} className="min-w-0 flex-1">
              <button type="button" disabled={!finished} onClick={() => onJump(s)} aria-current={current ? "step" : undefined} aria-label={finished ? `Go back to ${stepLabel(s, type)}` : stepLabel(s, type)}
                className="group block w-full text-left disabled:cursor-default">
                <span className={cn("block h-[3px] rounded-full transition-colors duration-500", i <= index ? "bg-[#3FAE49]" : "bg-[#DDE5DF]")} />
                <span className={cn("mt-1.5 hidden items-center gap-1 truncate text-[11px] font-semibold sm:flex", current ? "text-[#16201B]" : finished ? "text-[#3FAE49] group-hover:underline" : "text-[#9AA8A0]")}>
                  {finished && <Check className="size-3 shrink-0" strokeWidth={3} />}{stepLabel(s, type)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-xs font-medium text-[#3FAE49] sm:hidden">Step {index + 1} of {flow.length} · {stepLabel(flow[index], type)}</p>
    </nav>
  );
}

function Arcs({ light = false }: { light?: boolean }) {
  return (
    <svg aria-hidden className={cn("pointer-events-none absolute", light ? "right-[-180px] bottom-[-120px] h-[620px] w-[620px] opacity-[0.07]" : "top-[-160px] left-[40px] h-[560px] w-[560px] opacity-60")} viewBox="0 0 200 200" fill="none">
      {[90, 66, 42].map(r => <path key={r} d={`M ${100 - r} 200 A ${r} ${r} 0 0 1 ${100 + r} 200`} stroke={light ? "#3FAE49" : "#2C4A2F"} strokeWidth="14" strokeLinecap="round" transform="rotate(180 100 120)" />)}
    </svg>
  );
}

// A labelled field. While its text box has focus, a row opens under it exactly as tall as Ol and Ol's tip (the CSS
// variable --ol-row, set by MascotFollower), so Ol sits in that row and never covers the next field.
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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
      <label className="block"><span className="mb-1.5 block text-sm font-semibold text-[#2E3B33]">{label}{required && <span className="text-red-500"> *</span>}</span>{children}</label>
      <div ref={row} aria-hidden className="scroll-mb-28 transition-[height] duration-200 ease-out motion-reduce:transition-none" style={{ height: open ? "var(--ol-row, 64px)" : 0 }} />
    </div>
  );
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { onValue: (v: string) => void; tip?: string }) {
  const { react } = useMascot();
  const { onValue, className, tip, ...rest } = props;
  return <input {...rest} data-ol-tip={tip} onFocus={() => react("listening", 1800)} onChange={e => { onValue(e.target.value); react("working", 900); }}
    className={cn("h-12 w-full rounded-xl border border-[#DCE4DE] bg-[#F7FAF7] px-4 text-[15px] outline-none transition placeholder:text-[#9AA8A0] focus:border-[#3FAE49] focus:bg-white focus:ring-4 focus:ring-[#3FAE49]/15", className)} />;
}
function Heading({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return <div className="mt-5 mb-2 flex items-baseline justify-between gap-3 text-sm"><span className="font-semibold">{children}</span>{right && <span className="shrink-0 text-[#3FAE49]">{right}</span>}</div>;
}

function Start({ f, set }: { f: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  const { react, say } = useMascot();
  return <>
    <h2 className={H2}>Let&apos;s get you started</h2>
    <p className="mt-1 text-[#5E6E65]">Takes about 2 minutes. We save your draft as you go.</p>
    <Heading>Partner type <span className="text-red-500">*</span></Heading>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label="Partner type">
      {taxonomy.types.map(t => {
        const I = TYPE_ICONS[t.id as PartnerType]; const on = f.partner_type === t.id;
        return <motion.button key={t.id} type="button" role="radio" aria-checked={on} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
          onClick={() => { if (on) return; setF_type(set, t.id as PartnerType); say(`type.${t.id}`, "excited"); }}
          className={cn("flex items-center gap-2.5 rounded-2xl border bg-white p-3 text-left transition-colors", on ? "border-[#3FAE49] bg-[#ECF7EC] ring-1 ring-[#3FAE49]" : "border-[#E2E8E3] hover:border-[#BFD3C3]")}>
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-full transition-colors", on ? "bg-[#3FAE49] text-white" : "bg-[#EEF2EF] text-[#5E6E65]")}><I className="size-[18px]" /></span>
          <span className="min-w-0"><span className="block leading-tight font-bold">{t.title}</span><span className="block truncate text-[11px] text-[#6B7A72]">{t.hint}</span></span>
        </motion.button>;
      })}
    </div>
    <div className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">
      <Field label="Business name" required><Input value={f.business_name} tip="business_name" onValue={v => set("business_name", v)} placeholder="Your shop or brand name" autoComplete="organization" /></Field>
      <Field label="Owner name" required><Input value={f.owner_name} tip="owner_name" onValue={v => set("owner_name", v)} placeholder="Enter full name" autoComplete="name" /></Field>
      <Field label="Phone" required><Input value={f.phone} tip="phone" onValue={v => set("phone", v)} placeholder="10-digit mobile number" inputMode="tel" autoComplete="tel-national" /></Field>
      <Field label="Email" required><Input value={f.email} tip="email" onValue={v => set("email", v)} placeholder="you@business.com" type="email" autoComplete="email" /></Field>
    </div>
    <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-[#4A5A50]">
      <input type="checkbox" checked={f.consent} onChange={e => { set("consent", e.target.checked); if (e.target.checked) react("happy", 1200); }} className="mt-0.5 size-4 accent-[#3FAE49]" />
      <span>Save my draft and let OneLocal contact me about joining. My details are used only for onboarding.</span>
    </label>
  </>;
}
// Changing the partner type changes what the next steps ask, so the earlier picks are cleared.
function setF_type(set: <K extends keyof Form>(k: K, v: Form[K]) => void, t: PartnerType) {
  set("partner_type", t); set("category_family", ""); set("category", ""); set("subcategories", []);
}

// One tile in a grid of choices (store type, category, food type).
function Tile({ name, hint, slug, on, onClick, multi = false, i = 0 }: { name: string; hint?: string; slug: string; on: boolean; onClick: () => void; multi?: boolean; i?: number }) {
  const { react } = useMascot();
  return (
    <motion.button type="button" role={multi ? "checkbox" : "radio"} aria-checked={on} onClick={onClick} onMouseEnter={() => react("curious", 700)}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(i, 12) * 0.02 } }} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
      className={cn("relative flex min-h-[60px] items-center gap-3 rounded-2xl border bg-white p-2.5 pr-8 text-left transition-colors", on ? "border-[#3FAE49] bg-[#ECF7EC] ring-1 ring-[#3FAE49]" : "border-[#E2E8E3] hover:border-[#BFD3C3]")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon(slug)} alt="" className="size-10 shrink-0 rounded-xl object-cover" />
      <span className="min-w-0"><span className="block text-[14px] leading-tight font-bold">{name}</span>{hint && <span className="mt-0.5 block text-xs text-[#6B7A72]">{hint}</span>}</span>
      <span className={cn("absolute top-2 right-2 grid size-[18px] place-items-center border-2 transition-colors", multi ? "rounded-md" : "rounded-full", on ? "border-[#3FAE49] bg-[#3FAE49]" : "border-[#CBD5CE]")}>{on && <Check className="size-3 text-white" strokeWidth={3.5} />}</span>
    </motion.button>
  );
}
function Chip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <motion.button type="button" role="checkbox" aria-checked={on} onClick={onClick} whileTap={{ scale: 0.95 }}
      className={cn("flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors", on ? "border-[#3FAE49] bg-[#3FAE49] text-white" : "border-[#DCE4DE] bg-[#F7FAF7] text-[#2E3B33] hover:border-[#BFD3C3]")}>
      {on ? <Check className="size-3.5" strokeWidth={3} /> : <span className="size-3.5 rounded-full border-2 border-[#CBD5CE]" />}{label}
    </motion.button>
  );
}

// Store type, category and what you sell, on one screen: the items appear under the grid once a category is picked.
function WhatYouSell({ f, onFamily, onCategory, onToggle }: { f: Form; onFamily: (v: string) => void; onCategory: (v: string) => void; onToggle: (v: string) => void }) {
  const store = f.partner_type === "store";
  const family = taxonomy.store.families.find(x => x.name === f.category_family);
  const cats = store ? family?.categories ?? [] : taxonomy.service.categories;
  const cat = cats.find(c => c.name === f.category);
  const items = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!cat) return;
    const t = setTimeout(() => items.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 200);
    return () => clearTimeout(t);
  }, [cat]);
  return <>
    <h2 className={H2}>{store ? "What do you sell?" : "What service do you offer?"}</h2>
    <p className="mt-1 text-[#5E6E65]">{store ? "Pick your shop type and category, then tick what you sell." : "Pick a category, then tick the services you offer."}</p>
    {store && <>
      <Heading>Shop type</Heading>
      <div role="radiogroup" aria-label="Shop type" className="grid gap-2.5 sm:grid-cols-2">
        {taxonomy.store.families.map((x, i) => <Tile key={x.name} i={i} name={x.name} hint={x.hint} slug={x.icon} on={f.category_family === x.name} onClick={() => onFamily(x.name)} />)}
      </div>
    </>}
    {cats.length > 0 && <>
      <Heading right={`${cats.length} options`}>Category</Heading>
      <div role="radiogroup" aria-label="Category" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {cats.map((c, i) => <Tile key={c.name} i={i} name={c.name} slug={c.icon} on={f.category === c.name} onClick={() => onCategory(c.name)} />)}
      </div>
    </>}
    <AnimatePresence mode="wait">
      {cat && (
        <motion.div ref={items} key={cat.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 scroll-mb-28 rounded-2xl border border-[#E2E8E3] bg-white p-4">
          <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{store ? `What do you sell in ${cat.name}?` : `Which ${cat.name} services do you offer?`}</span>
            <span className="shrink-0 text-[#3FAE49]">{f.subcategories.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">{cat.subcategories.map(s => <Chip key={s} label={s} on={f.subcategories.includes(s)} onClick={() => onToggle(s)} />)}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </>;
}

function RestaurantTypes({ values, onToggle }: { values: string[]; onToggle: (v: string) => void }) {
  return <>
    <h2 className={H2}>What food do you serve?</h2>
    <p className="mt-1 text-[#5E6E65]">Tick everything on your menu.</p>
    <Heading right={`${values.length} selected`}>Food types</Heading>
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {taxonomy.restaurant.types.map((r, i) => <Tile key={r.name} i={i} multi name={r.name} slug={r.icon} on={values.includes(r.name)} onClick={() => onToggle(r.name)} />)}
    </div>
  </>;
}

function Business({ f, set }: { f: Form; set: <K extends keyof Form>(k: K, v: Form[K]) => void }) {
  const { react } = useMascot();
  const food = f.partner_type === "restaurant" || f.category_family === "Grocery and daily needs";
  const services = [{ id: "delivery", label: "Home delivery" }, { id: "pickup", label: "Pickup" }, ...(f.partner_type === "restaurant" ? [{ id: "dine_in", label: "Dine-in" }] : [])];
  return <>
    <h2 className={H2}>Where is your business?</h2>
    <p className="mt-1 text-[#5E6E65]">So customers nearby can find you, and riders can reach you.</p>
    <div className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-[1fr_160px]">
      <Field label="Shop address" required><Input value={f.address} tip="address" onValue={v => set("address", v)} placeholder="Shop no., street, area" autoComplete="street-address" /></Field>
      <Field label="PIN code" required><Input value={f.pin_code} tip="pin_code" onValue={v => set("pin_code", v.replace(/\D/g, "").slice(0, 6))} placeholder="413512" inputMode="numeric" autoComplete="postal-code" /></Field>
      <Field label="GSTIN (optional)"><Input value={f.gstin} tip="gstin" onValue={v => set("gstin", v.toUpperCase())} placeholder="27ABCDE1234F1Z5" /></Field>
      <Field label="Outlets"><Input value={f.outlets} tip="outlets" onValue={v => set("outlets", v.replace(/\D/g, "").slice(0, 3))} inputMode="numeric" /></Field>
      {food && <Field label="FSSAI licence (optional)"><Input value={f.fssai} tip="fssai" onValue={v => set("fssai", v.replace(/\D/g, "").slice(0, 14))} placeholder="14 digits" inputMode="numeric" /></Field>}
    </div>
    {f.partner_type !== "logistic" && f.partner_type !== "service" && <>
      <Heading>How do customers get their orders?</Heading>
      <div className="flex flex-wrap gap-2">
        {services.map(s => { const on = f.services.includes(s.id); return <button key={s.id} type="button" aria-pressed={on} onClick={() => { set("services", on ? f.services.filter(x => x !== s.id) : [...f.services, s.id]); react("happy", 900); }}
          className={cn("rounded-full border px-4 py-2 text-sm font-semibold transition active:scale-95", on ? "border-[#3FAE49] bg-[#3FAE49] text-white" : "border-[#DCE4DE] bg-white text-[#4A5A50]")}>{s.label}</button>; })}
      </div>
      <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-[#4A5A50]"><input type="checkbox" checked={f.own_delivery} onChange={e => set("own_delivery", e.target.checked)} className="size-4 accent-[#3FAE49]" />I have my own delivery staff</label>
    </>}
    <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-[#4A5A50]"><input type="checkbox" checked={f.whatsapp_ok} onChange={e => set("whatsapp_ok", e.target.checked)} className="size-4 accent-[#3FAE49]" />Send me updates on WhatsApp</label>
  </>;
}

// The last step: the Partner app password, then a compact summary of everything with Edit links.
function Finish({ f, pw, setPw, goto }: { f: Form; pw: { password: string; confirm: string }; setPw: (p: { password: string; confirm: string }) => void; goto: (s: Screen) => void }) {
  const { say } = useMascot();
  const [show, setShow] = useState(false);
  const score = [pw.password.length >= 8, /[A-Za-z]/.test(pw.password), /\d/.test(pw.password), /[^A-Za-z0-9]/.test(pw.password) || pw.password.length >= 12].filter(Boolean).length;
  const strong = score >= 3 && pw.password.length >= 8;
  const was = useRef(false);
  useEffect(() => { if (!pw.password) return; if (strong !== was.current) { was.current = strong; say(strong ? "passwordStrong" : "passwordWeak", strong ? "proud" : undefined); } }, [strong, pw.password, say]);
  const label = ["Too short", "Weak", "Okay", "Strong", "Very strong"][score];

  const type = taxonomy.types.find(t => t.id === f.partner_type)?.title ?? "";
  const what: { screen: Screen; rows: [string, string][] } | null =
    f.partner_type === "store" ? { screen: "category", rows: [["Shop type", f.category_family], ["Category", f.category], ["Sells", f.subcategories.join(", ")]] }
    : f.partner_type === "service" ? { screen: "category", rows: [["Category", f.category], ["Services", f.subcategories.join(", ")]] }
    : f.partner_type === "restaurant" ? { screen: "rtypes", rows: [["Food", f.subcategories.join(", ")]] }
    : null;
  const where: [string, string][] = [["Address", `${f.address}, ${f.pin_code}`], ["Outlets", f.outlets || "1"], ...(f.gstin ? [["GSTIN", f.gstin] as [string, string]] : []), ...(f.fssai ? [["FSSAI", f.fssai] as [string, string]] : [])];

  return <>
    <h2 className={H2}>Last step: your login</h2>
    <p className="mt-1 text-[#5E6E65]">Sign in to the VINII Partner app with <span className="font-semibold text-[#16201B]">{f.email}</span> and this password once your store is approved.</p>
    <div className="mt-5 grid gap-x-4 gap-y-3 sm:grid-cols-2">
      <Field label="Password" required>
        <div className="relative"><Input type={show ? "text" : "password"} tip="password" value={pw.password} onValue={v => setPw({ ...pw, password: v })} placeholder="8+ characters with a number" autoComplete="new-password" className="pr-16" />
          <button type="button" onClick={() => setShow(x => !x)} className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-[#3FAE49]">{show ? "Hide" : "Show"}</button></div>
      </Field>
      <Field label="Confirm password" required><Input type={show ? "text" : "password"} tip="password_confirm" value={pw.confirm} onValue={v => setPw({ ...pw, confirm: v })} placeholder="Type it again" autoComplete="new-password" /></Field>
    </div>
    <div className="mt-3 flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5">{[0, 1, 2, 3].map(i => <motion.span key={i} className="h-1.5 flex-1 rounded-full" animate={{ backgroundColor: i < score ? (score >= 3 ? "#3FAE49" : score === 2 ? "#F2B705" : "#E5484D") : "#DDE5DF" }} />)}</div>
      {pw.password && <span className="w-24 text-right text-xs font-semibold text-[#5E6E65]">{label}</span>}
    </div>
    {pw.confirm && pw.confirm !== pw.password && <p className="mt-2 text-sm text-red-600">The passwords don’t match yet.</p>}
    <p className="mt-2 text-xs text-[#6B7A72]">Never share your password, not even with the OneLocal team. We will never ask for it.</p>

    <h3 className="mt-7 mb-3 text-lg font-extrabold tracking-tight">Check your details</h3>
    <div className="grid gap-3">
      <Summary title="You" onEdit={() => goto("start")} rows={[["Partner type", type], ["Business", f.business_name], ["Owner", f.owner_name], ["Phone", f.phone], ["Email", f.email]]} />
      {what && <Summary title={stepLabel(what.screen, f.partner_type)} onEdit={() => goto(what.screen)} rows={what.rows} />}
      <Summary title="Where" onEdit={() => goto("business")} rows={where} />
    </div>
  </>;
}
function Summary({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <section className="rounded-2xl border border-[#E2E8E3] bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-bold">{title}</h4>
        <button type="button" onClick={onEdit} className="flex items-center gap-1 text-sm font-semibold text-[#3FAE49] hover:underline"><Pencil className="size-3.5" />Edit<span className="sr-only"> {title}</span></button>
      </div>
      <dl className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {rows.map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-xs text-[#6B7A72]">{k}</dt><dd className="text-sm font-semibold break-words">{v || "—"}</dd></div>)}
      </dl>
    </section>
  );
}

function Done({ reference, existing, business, email, login }: { reference: string; existing: boolean; business: string; email: string; login?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md pt-6 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-full bg-[#3FAE49] text-white"><Check className="size-8" strokeWidth={3} /></motion.div>
      <h2 className="mt-5 text-3xl font-extrabold tracking-tight">{existing ? "We already have your application" : "Application sent!"}</h2>
      <p className="mt-2 text-[#5E6E65]">Thank you, {business}. Our Latur team will call you to verify your details and set up your store.</p>
      {login && <p className="mx-auto mt-4 max-w-sm rounded-xl bg-white px-4 py-3 text-sm text-[#4A5A50] ring-1 ring-[#E2E8E3]">{login === "exists"
        ? <>This email already has a OneLocal login. Use that password in the VINII Partner app.</>
        : login === "confirm_email" ? <>Check <b>{email}</b> and confirm your email, then sign in to the VINII Partner app.</>
        : <>Your login is ready: sign in to the VINII Partner app with <b>{email}</b>. Your store appears there once it is approved.</>}</p>}
      <div className="mx-auto mt-6 w-fit rounded-2xl border border-dashed border-[#3FAE49] bg-white px-6 py-4"><p className="text-xs tracking-widest text-[#6B7A72] uppercase">Your reference</p><p className="mt-1 font-mono text-2xl font-black tracking-wider">{reference}</p></div>
      <Link href="/" className="mt-8 inline-block text-sm font-semibold text-[#3FAE49] hover:underline">Back to home</Link>
    </motion.div>
  );
}

// Which language Ol speaks: English or Hinglish. Remembered on this browser.
function LangToggle() {
  const { lang, setLang, say } = useMascot();
  return <div role="radiogroup" aria-label="Ol’s language" className="flex rounded-full bg-[#E7EEE9] p-0.5 text-xs font-bold">
    {([["en", "English", "Eng"], ["hinglish", "Hinglish", "Hinglish"], ["hi", "हिन्दी", "हिन्दी"]] as const).map(([v, t, short]) => <button key={v} type="button" role="radio" aria-checked={lang === v} aria-label={t}
      onClick={() => { setLang(v); setTimeout(() => say("welcome", "happy"), 60); }}
      className={cn("rounded-full px-2.5 py-1 transition-colors sm:px-3", lang === v ? "bg-white text-[#16201B] shadow-sm" : "text-[#6B7A72]")}><span className="sm:hidden">{short}</span><span className="hidden sm:inline">{t}</span></button>)}
  </div>;
}
