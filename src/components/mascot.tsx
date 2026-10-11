"use client";

// "Ol", the OneLocal mascot, built with Bible Strong Avatar Lab (AGPL-3.0, by Stéphane Montlouis-Calixte; see /source),
// following the "Make your own animated mascot" guide (Saksham Gupta, Oct 2026).
//
// MASCOT CARD
//   Name:        Ol ("OneLocal" in two letters). A cheerful little shopkeeper's helper who gets very excited about your first order.
//   Starter:     Strobi (the round ball): a perfect circle reads friendliest and echoes the "O" of OneLocal.
//   Body:        OneLocal lime #8cf52b, eyes deep green #0b1f16.
//   Moments:     waking when a page opens, excited on the main button, listening/working while typing,
//                thinking while sending, confused on a mistake, celebrate after a sign-up, laughing when clicked,
//                drowsy then sleeping after 30 s with no activity (any movement wakes it).
//   Places:      bottom-right on every page (with a tip bubble); on the onboarding page it hops onto the text box
//                you are typing in and slides along with your text (MascotFollower).
// Only those 16 animations are in ol.avatar.json, so the file stays small.
import "@bible-strong/avatar-react/styles.css";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useAnimate } from "motion/react";
import { createAvatar, type AvatarController } from "@bible-strong/avatar-react";
import definition from "@/lib/ol.avatar.json";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import { olLine, OL_TIPS, type OlLang } from "@/lib/ol-lines";

const Ol = createAvatar(definition as never);

export type Mood = "idle" | "waking" | "listening" | "thinking" | "working" | "happy" | "excited" | "curious" | "confused" | "sad" | "celebrate" | "playful" | "proud" | "laughing" | "drowsy" | "sleeping";

// say(key) speaks a line from ol-lines.ts in the visitor's language (English or Hinglish), with a mood and a hop.
type Speech = { text: string; id: number } | null;
type Jolt = { kind: "hop" | "shake"; n: number };
type Ctx = {
  react: (mood: Mood, ms?: number) => void; say: (key: string, mood?: Mood, vars?: Record<string, string>) => void;
  ref: React.RefObject<AvatarController | null>; asleep: boolean; reduce: boolean;
  lang: OlLang; setLang: (l: OlLang) => void; speech: Speech; jolt: Jolt;
};
const HOP: Mood[] = ["happy", "excited", "celebrate", "proud", "laughing", "playful"];
const LANG_KEY = "onelocal.ol-lang.v1";
const MascotContext = createContext<Ctx | null>(null);
const IDLE_MS = 30_000;

export function MascotProvider({ children }: { children: React.ReactNode }) {
  const reduce = !!useReducedMotion();
  const ref = useRef<AvatarController | null>(null);
  const back = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nap = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mood = useRef<Mood>("idle");
  const [asleep, setAsleep] = useState(false);
  const sleeping = useRef(false);
  const [lang, setLangState] = useState<OlLang>("en");
  const [speech, setSpeech] = useState<Speech>(null);
  const [jolt, setJolt] = useState<Jolt>({ kind: "hop", n: 0 });
  const hush = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => { try { const v = localStorage.getItem(LANG_KEY); if (v === "hinglish" || v === "en" || v === "hi") setLangState(v); } catch { /* ignore */ } }, []);
  const setLang = useCallback((l: OlLang) => { setLangState(l); try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ } }, []);
  const langRef = useRef(lang); useEffect(() => { langRef.current = lang; }, [lang]);

  const play = useCallback((m: Mood) => {
    if (reduce) { ref.current?.setExpression("neutral" as never); return; }
    if (mood.current !== m) { ref.current?.play(m as never); mood.current = m; }
  }, [reduce]);
  const react = useCallback((m: Mood, ms = 2200) => {
    clearTimeout(back.current);
    play(m);
    if (!reduce && HOP.includes(m)) setJolt(j => ({ kind: "hop", n: j.n + 1 }));
    if (!reduce && (m === "confused" || m === "sad")) setJolt(j => ({ kind: "shake", n: j.n + 1 }));
    if (m !== "idle" && m !== "sleeping" && ms > 0) back.current = setTimeout(() => play("idle"), ms);
  }, [play, reduce]);
  // Every line Ol speaks goes away on its own, long enough to read it.
  const speak = useCallback((text: string) => {
    clearTimeout(hush.current);
    setSpeech({ text, id: Date.now() });
    hush.current = setTimeout(() => setSpeech(null), Math.max(2800, text.length * 70));
  }, []);
  const say = useCallback((key: string, m?: Mood, vars: Record<string, string> = {}) => {
    const text = olLine(key, langRef.current, vars);
    if (m) react(m, 2600);
    if (text) speak(text);
  }, [react, speak]);

  // Page opens: wake up. No activity for 30 s: drowsy, then asleep. Any movement wakes it.
  useEffect(() => {
    const t = setTimeout(() => react("waking", 1800), 250);
    const doze = () => {
      clearTimeout(nap.current);
      nap.current = setTimeout(() => {
        react("drowsy", 0);
        nap.current = setTimeout(() => { sleeping.current = true; setAsleep(true); react("sleeping", 0); }, 6000);
      }, IDLE_MS);
    };
    const activity = () => {
      if (sleeping.current) { sleeping.current = false; setAsleep(false); react("waking", 1600); const t = olLine("wake", langRef.current); if (t) speak(t); }
      else if (mood.current === "drowsy") react("idle", 0);
      doze();
    };
    const events = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach(e => window.addEventListener(e, activity, { passive: true }));
    doze();
    return () => { clearTimeout(t); clearTimeout(nap.current); events.forEach(e => window.removeEventListener(e, activity)); };
  }, [react, speak]);

  const value = useMemo(() => ({ react, say, ref, asleep, reduce, lang, setLang, speech, jolt }), [react, say, asleep, reduce, lang, setLang, speech, jolt]);
  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}

export function useMascot() {
  const c = useContext(MascotContext);
  return c ?? { react: () => {}, say: () => {}, ref: { current: null }, asleep: false, reduce: false, lang: "en" as OlLang, setLang: () => {}, speech: null, jolt: { kind: "hop" as const, n: 0 } };
}

// Clicking Ol makes it laugh.
export function Mascot({ size = 140, className, label = "Ol, the OneLocal mascot. Click to say hi." }: { size?: number | string; className?: string; label?: string }) {
  const { ref, say, reduce, jolt } = useMascot();
  const [scope, animate] = useAnimate();
  // A hop when Ol is happy or excited, a head-shake when confused. Runs on a wrapper so the avatar itself never remounts.
  useEffect(() => {
    if (!jolt.n || reduce || !scope.current) return;
    if (jolt.kind === "hop") void animate(scope.current, { y: [0, -28, 0, -10, 0], scaleY: [1, 1.08, 0.9, 1.04, 1], scaleX: [1, 0.94, 1.1, 0.98, 1] }, { duration: 0.75, ease: "easeOut" });
    else void animate(scope.current, { x: [0, -9, 9, -6, 4, 0] }, { duration: 0.5 });
  }, [jolt, reduce, animate, scope]);
  return (
    <button type="button" onClick={() => say("laugh", "laughing")} aria-label={label} className={cn("cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#8cf52b]", className)}>
      <span ref={scope} className="block" style={{ transformOrigin: "50% 100%" }}>
        <Ol ref={ref as never} {...(reduce ? { defaultExpression: "neutral" as never } : { defaultAnimation: "idle" as never })} size={size} ariaLabel="Ol" />
      </span>
    </button>
  );
}

// Bottom-right on every page that does not place Ol itself. A section's tip shows for a few seconds when that section
// comes into view, then goes away so it never sits on top of the page (e.g. the demo's "Try again" button); what Ol says
// goes away on its own too. Smaller on phones; the tip bubble is hidden on very small screens.
const SECTION_TIP_MS = 6000;
export function FloatingMascot() {
  const path = usePathname();
  const { asleep, speech } = useMascot();
  const [sectionTip, setTip] = useState<string | null>(null);
  const tip = speech?.text ?? sectionTip;
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    setClosed(false); setTip(null);
    const sections = [...document.querySelectorAll<HTMLElement>("[data-mascot-tip]")];
    if (!sections.length) return;
    let last: string | null = null;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(entries => {
      const best = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      const next = (best?.target as HTMLElement | undefined)?.dataset.mascotTip ?? null;
      if (!next || next === last) return;
      last = next; setTip(next);
      clearTimeout(hide); hide = setTimeout(() => setTip(null), SECTION_TIP_MS);
    }, { threshold: [0.35, 0.6] });
    sections.forEach(s => io.observe(s));
    return () => { io.disconnect(); clearTimeout(hide); };
  }, [path]);
  if (path?.startsWith("/join")) return null; // the onboarding page runs its own MascotFollower
  return (
    <div className="pointer-events-none fixed right-3 bottom-3 z-[2147483000] isolate flex items-end gap-2 sm:right-5 sm:bottom-5">
      <AnimatePresence mode="wait">
        {tip && !closed && !asleep && (
          <motion.div key={tip} initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
            className="pointer-events-auto relative mb-14 hidden max-w-[230px] rounded-2xl rounded-br-sm bg-white px-4 py-3 text-sm leading-snug font-medium text-neutral-900 shadow-[0_16px_40px_rgba(0,0,0,0.35)] min-[480px]:block">
            {tip}
            <button type="button" onClick={() => setClosed(true)} aria-label="Hide tip" className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full bg-neutral-900 text-xs text-white">×</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-auto">
        <Mascot size="clamp(64px, 18vw, 96px)" />
      </div>
    </div>
  );
}

// Onboarding: Ol sits on its "home" spot (the first visible element with data-mascot-home: the storefront panel on
// laptops, a small spot in the header on phones) until a text box gets focus. Then it hops just under that box, slides
// along with the caret as you type, and gives the tip for that field (data-ol-tip on the input, e.g. "Use your WhatsApp
// number"). The form opens a row of exactly that height under the focused field (CSS var --ol-row, set here), so Ol and
// its tip never cover the next field. Other moments (picks, errors, success) show what Ol says. Back home on blur.
const caretCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
function caretX(input: HTMLInputElement | HTMLTextAreaElement) {
  const style = getComputedStyle(input);
  const ctx = caretCanvas?.getContext("2d");
  const before = input.value.slice(0, input.selectionStart ?? input.value.length) || "";
  if (ctx) ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  const text = input.type === "password" ? "•".repeat(before.length) : before;
  const width = ctx ? ctx.measureText(text).width : before.length * 8;
  return parseFloat(style.paddingLeft) + width - input.scrollLeft;
}

// Where the speech bubble sits: beside Ol (right/left, while perched), above it (storefront panel) or below it (header).
type Side = "right" | "left" | "above" | "below";
type Spot = { x: number; y: number; scale: number; perched: boolean; tip: string | null; side: Side; room: number };
const PERCH = 0.75; // Ol is a little smaller while sitting under a text box
const GAP = 8;

export function MascotFollower({ size = 64 }: { size?: number }) {
  const { reduce, lang, speech, asleep } = useMascot();
  const [spot, setSpot] = useState<Spot | null>(null);
  const field = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const place = useCallback(() => {
    const W = window.innerWidth;
    const el = field.current;
    if (el && document.activeElement === el) {
      const r = el.getBoundingClientRect();
      const s = size * PERCH;
      const x = Math.max(r.left, Math.min(r.left + caretX(el) - s / 2, r.right - s));
      const key = el.dataset.olTip;
      const tip = key ? olLine(key, lang, {}, OL_TIPS) : null;
      const right = W - (x + s + GAP) - 12, left = x - GAP - 12; // the tip reads best to the right; left only when cramped
      setSpot({ x, y: r.bottom + 6, scale: PERCH, perched: true, tip, side: right >= 260 || right >= left ? "right" : "left", room: Math.min(300, right >= 260 || right >= left ? right : left) });
      return;
    }
    const home = [...document.querySelectorAll<HTMLElement>("[data-mascot-home]")].map(h => h.getBoundingClientRect()).find(h => h.width > 0 && h.height > 0);
    if (home) setSpot({ x: home.left, y: home.top, scale: home.width / size, perched: false, tip: null, side: home.top < 200 ? "below" : "above", room: Math.min(300, home.right - 12) });
    else setSpot({ x: W - size - 16, y: window.innerHeight - size - 96, scale: 1, perched: false, tip: null, side: "left", room: Math.min(300, W - size - 40) });
  }, [size, lang]);

  useEffect(() => {
    const isText = (t: EventTarget | null): t is HTMLInputElement | HTMLTextAreaElement =>
      (t instanceof HTMLInputElement && ["text", "email", "tel", "search", "url", "number", "password"].includes(t.type)) || t instanceof HTMLTextAreaElement;
    const onFocus = (e: FocusEvent) => { if (isText(e.target)) { field.current = e.target; place(); } };
    const onBlur = () => { setTimeout(() => { if (!isText(document.activeElement)) { field.current = null; place(); } }, 0); };
    const onMove = () => { if (field.current) place(); };
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", onBlur);
    document.addEventListener("input", onMove, true);
    document.addEventListener("selectionchange", onMove);
    document.addEventListener("keyup", onMove, true);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    const t = setTimeout(place, 50);
    const ro = new ResizeObserver(place); ro.observe(document.body);
    return () => {
      clearTimeout(t); ro.disconnect();
      document.removeEventListener("focusin", onFocus); document.removeEventListener("focusout", onBlur);
      document.removeEventListener("input", onMove, true); document.removeEventListener("selectionchange", onMove);
      document.removeEventListener("keyup", onMove, true);
      window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true);
    };
  }, [place]);

  // While in a text box the field's tip wins (e.g. "use your WhatsApp number"); otherwise whatever Ol just said.
  const bubble = !spot || asleep ? null : spot.perched ? (spot.tip ?? speech?.text ?? null) : speech?.text ?? null;

  // Tell the form how much room Ol and its tip need under the focused field.
  useEffect(() => {
    if (!spot?.perched) return;
    const root = document.documentElement;
    const set = () => root.style.setProperty("--ol-row", `${Math.round(Math.max(size * PERCH, bubbleRef.current?.offsetHeight ?? 0) + 14)}px`);
    set();
    const el = bubbleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(set); ro.observe(el);
    return () => ro.disconnect();
  }, [spot?.perched, bubble, size]);

  if (!spot) return null;
  const s = size * spot.scale;
  const pos: React.CSSProperties = spot.side === "right" ? { top: 2, left: s + GAP } : spot.side === "left" ? { top: 2, right: size + GAP }
    : spot.side === "above" ? { bottom: size + GAP, right: size - s } : { top: s + GAP, right: size - s };
  return (
    <motion.div className="pointer-events-none fixed top-0 left-0 z-[2147483000]" style={{ width: size, height: size }} initial={false}
      animate={{ x: spot.x, y: spot.y }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: spot.perched ? 520 : 170, damping: spot.perched ? 34 : 18, mass: 0.6 }}>
      <motion.div className="pointer-events-auto" animate={{ scale: spot.scale }} initial={false} style={{ transformOrigin: "0 0" }} transition={{ type: "spring", stiffness: 220, damping: 20 }}>
        <Mascot size={size} />
      </motion.div>
      <AnimatePresence mode="wait">
        {bubble && (
          <motion.div ref={bubbleRef} key={bubble} role="status" aria-live="polite" initial={{ opacity: 0, y: -4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            className={cn("absolute w-max rounded-2xl bg-[#0b1f16] px-3.5 py-2.5 text-[13px] leading-snug font-medium text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]",
              spot.side === "right" ? "rounded-tl-sm" : spot.side === "left" ? "rounded-tr-sm" : spot.side === "above" ? "rounded-br-sm" : "rounded-tr-sm")}
            style={{ ...pos, maxWidth: spot.room }}>
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
