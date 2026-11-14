"use client";

// The top of the page. A phone stays pinned while the scroll moves one order through the three apps: the customer
// app, the Partner POS, the rider app, then the finished order back in the POS. Beside it, pop lettering says what
// each app does for the partner. The first stop is the welcome, with the first question of the application.
// The phone shows real screens of the three apps; the figures in them are sample data.
//
// Kept light on purpose: text and screens swap with opacity and movement only (no blur), and the pinned area uses
// the small and large viewport heights so a phone browser's address bar sliding away does not make it jump.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { ArrowRight, Check, Landmark } from "lucide-react";
import type { LandingCopy } from "@/lib/landing-copy";
import { DitherField, type Mood } from "./dither-field";

const EASE = [0.16, 1, 0.3, 1] as const;
// Stops: 0 welcome, 1 customer app, 2 Partner POS, 3 rider app, 4 delivered.
export const STOPS = 5;
export const MOOD: Mood[] = ["lime", "mint", "lime", "forest", "lime"];
// The sample order followed through the journey; the amount matches the finished order on the last screen.
const TOTAL = "₹1,240";
type P = LandingCopy["journey"]["phone"];
// The app screens shown at the later stops.
const SHOTS = ["/shots/customer-home.jpg", "/shots/pos-home.jpg", "/shots/rider-job.jpg", "/shots/pos-orders.jpg"];

// A comic starburst: 14 points, alternating a long and a short reach.
const BURST = Array.from({ length: 28 }, (_, i) => { const r = i % 2 ? 72 : 104, a = (i / 28) * Math.PI * 2; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(" ");

// A real app screen. With `pan`, a taller screen glides up slowly so more of it is seen.
function Shot({ src, alt, pan = 0, still = false }: { src: string; alt: string; pan?: number; still?: boolean }) {
  if (!pan || still) return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} decoding="async" className="block size-full object-cover object-top" draggable={false} />
  );
  return (
    <motion.img src={src} alt={alt} className="block w-full" draggable={false}
      initial={{ y: "0%" }} animate={{ y: `-${pan}%` }} transition={{ duration: 7, delay: 1.4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 1.6 }} />
  );
}

// The customer's order, about to be placed.
function PlaceOrder({ p }: { p: P }) {
  return (
    <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
      className="absolute inset-x-2.5 top-[38%] flex items-center justify-between gap-2 rounded-full bg-white py-1.5 pr-1.5 pl-3.5 text-(--ink) shadow-[0_14px_30px_-12px_rgba(6,24,10,0.55)] md:top-auto md:bottom-[13%]">
      <span className="ol-display text-[0.9rem] whitespace-nowrap tabular-nums">{TOTAL}</span>
      <motion.span className="rounded-full bg-(--ink) px-3.5 py-2 text-[0.75rem] font-semibold whitespace-nowrap text-(--mint)"
        animate={{ scale: [1, 1, 0.93, 1] }} transition={{ duration: 1.8, times: [0, 0.6, 0.72, 1], repeat: Infinity, repeatDelay: 0.6 }}>{p.place}</motion.span>
    </motion.div>
  );
}

// The same order ringing on the partner's POS; a moment later it is accepted.
function Ring({ p, instant }: { p: P; instant: boolean }) {
  const [accepted, setAccepted] = useState(instant);
  useEffect(() => { if (instant) return; const t = setTimeout(() => setAccepted(true), 2200); return () => clearTimeout(t); }, [instant]);
  return (
    <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
      className="absolute inset-x-3 top-[8.5%] flex items-center gap-2.5 rounded-3xl bg-white p-3 text-(--ink) shadow-[0_18px_40px_-14px_rgba(6,24,10,0.5)]">
      <span className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-300 ${accepted ? "bg-(--lime)" : "ol-ring bg-(--marigold)"}`}>
        {accepted ? <Check className="size-5" aria-hidden /> : <span className="size-2.5 rounded-full bg-(--ink)" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="ol-display truncate text-[0.9rem]">{accepted ? p.accepted : p.newOrder}</p>
        <p className="text-[0.7rem] whitespace-nowrap text-(--ink-soft) tabular-nums">{TOTAL}</p>
      </div>
      <span className={`shrink-0 rounded-full px-3 py-2 text-[0.72rem] font-semibold whitespace-nowrap tabular-nums transition-colors duration-300 max-md:hidden ${accepted ? "bg-(--mint-2)" : "bg-(--ink) text-(--mint)"}`}>
        {accepted ? <Check className="size-4" aria-hidden /> : `${p.accept} · 3:52`}
      </span>
    </motion.div>
  );
}

// The finished order, back in the POS's own order list, with the payout line laid over it.
function Payout({ p }: { p: P }) {
  return (
    <motion.div initial={{ y: 26, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
      className="absolute inset-x-3 top-[44%] flex items-center gap-3 rounded-3xl bg-(--lime) px-3.5 py-3 text-(--ink) shadow-[0_18px_40px_-14px_rgba(6,24,10,0.55)] md:top-auto md:bottom-[5%]">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-(--ink) text-(--lime)"><Landmark className="size-4" aria-hidden /></span>
      <p className="ol-display text-[0.85rem] leading-tight">{p.payout}</p>
    </motion.div>
  );
}

export function Journey({ t, hero, cta, ask, onStop }: {
  t: LandingCopy["journey"]; hero: LandingCopy["hero"]; cta: string; ask: React.ReactNode; onStop: (stop: number | null) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  // On a phone the handset sits right under the words, however tall they are in this language and on this screen.
  // The words' bottom edge is measured and handed to the stylesheet, which places the handset just below it.
  const words = useRef<HTMLDivElement>(null);
  const handset = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const w = words.current, h = handset.current;
    if (!w || !h) return;
    const place = () => h.style.setProperty("--under", `${w.offsetTop + w.offsetHeight}px`);
    place();
    const watch = new ResizeObserver(place);
    watch.observe(w);
    return () => watch.disconnect();
  }, []);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stop, setStop] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", v => {
    const next = Math.min(STOPS - 1, Math.max(0, Math.floor(v * STOPS)));
    setStop(next);
    onStop(v >= 0.999 ? null : next);
  });
  // Fetch the later screens once the page has settled, so the first swap to each one is instant.
  useEffect(() => { const t = setTimeout(() => SHOTS.forEach(src => { new Image().src = src; }), 1500); return () => clearTimeout(t); }, []);
  const mood = MOOD[stop];
  const chapter = stop >= 1 && stop <= 3 ? t.steps[stop - 1] : null;
  const shout = chapter ? t.shouts[stop - 1] : null;
  // A phrase between *stars* is painted in the pop colour.
  const paint = (text: string) => text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
  const rise = reduce ? { opacity: 0 } : { opacity: 0, y: 18 };

  const screens = [
    // The customer app's own opening screen: its logo on its dark green.
    <div key="splash" className="grid h-full place-items-center bg-[#0B1A10]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/onelocal-app-icon.png" alt="The One Local app logo" className="w-[44%]" draggable={false} />
    </div>,
    <div key="customer" className="relative h-full"><Shot src={SHOTS[0]} alt="The One Local customer app, showing shops and their products" /><PlaceOrder p={t.phone} /></div>,
    <div key="pos" className="relative h-full"><Shot src={SHOTS[1]} alt="The Partner POS home screen with active orders" pan={30} still={reduce} /><Ring p={t.phone} instant={reduce} /></div>,
    <Shot key="rider" src={SHOTS[2]} alt="The rider app showing the pickup and the drop on a map" />,
    <div key="done" className="relative h-full"><Shot src={SHOTS[3]} alt="The Partner POS order list, with the online order marked completed and delivered" /><Payout p={t.phone} /></div>,
  ];

  return (
    <section ref={ref} id="journey" className="relative" style={{ height: `${STOPS * 100}lvh` }}>
      <div className="sticky top-0 h-lvh overflow-hidden bg-(--lime)" data-tone={mood}>
        <DitherField mood={mood} travel={scrollYProgress} className="absolute inset-0 size-full" />
        <div className="relative mx-auto h-svh w-full max-w-6xl px-5 pt-24 pb-6 md:grid md:grid-cols-[minmax(0,1.2fr)_auto] md:items-center md:gap-x-14 md:px-8 md:pt-28 md:pb-10 lg:px-10">
          <div ref={words} className="relative z-10">
            {stop > 0 && (
              <ol className="mb-4 flex flex-wrap gap-1.5 md:hidden">
                {t.chapters.map((c, i) => (
                  <li key={c} className="rounded-full border-2 border-(--ink) px-3 py-0.5 text-xs font-bold transition-colors duration-500"
                    style={i === Math.min(stop, 3) - 1 ? { background: "var(--ink)", color: "var(--pop-hi)" } : { background: "#fff", color: "var(--ink)" }}>{c}</li>
                ))}
              </ol>
            )}
            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={stop} initial={rise} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }}>
                  {stop === 0 && (
                    <>
                      <h1 className="ol-pop max-w-[12ch] text-[clamp(3.1rem,7.8vw,6.6rem)]">{paint(hero.title)}</h1>
                      <p className="ol-pop-say ol-tall-only mt-6 max-w-md text-lg leading-snug sm:mt-8 sm:text-[1.4rem]">{hero.sub}</p>
                      <div className="mt-8 sm:mt-11">{ask}</div>
                    </>
                  )}
                  {chapter && (
                    <>
                      <h2 className="ol-pop text-[clamp(2.9rem,7.2vw,6.1rem)]">{paint(chapter.title)}</h2>
                      <p className="ol-pop-say mt-4 max-w-lg text-lg sm:mt-6 sm:text-2xl">{chapter.body}</p>
                      <ul className="ol-tall-only mt-5 space-y-3 sm:mt-8 sm:space-y-4">
                        {chapter.points.map((pt, i) => (
                          <motion.li key={pt} className="ol-pop-say flex items-center gap-3.5 text-lg sm:text-xl"
                            initial={reduce ? false : { opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.2 + i * 0.08, ease: EASE }}>
                            <span className="ol-pop-dot grid size-8 shrink-0 place-items-center rounded-full" style={{ WebkitTextStroke: 0 }}><Check className="size-5" strokeWidth={3.5} aria-hidden /></span>{pt}
                          </motion.li>
                        ))}
                      </ul>
                    </>
                  )}
                  {stop === 4 && (
                    <>
                      <h2 className="ol-pop text-[clamp(2.9rem,7.2vw,6.1rem)]">{paint(t.done.title)}</h2>
                      <p className="ol-pop-say ol-tall-only mt-4 max-w-lg text-lg sm:mt-6 sm:text-2xl">{t.done.body}</p>
                      <Link href="/join" className="ol-pill is-pop mt-7 sm:mt-9">{cta}<ArrowRight className="size-5" aria-hidden /></Link>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* On a phone the handset keeps one size and sits just under the words; on a wide screen it stands beside them. */}
          <div ref={handset} className="ol-handset">
            <div className="ol-iphone h-full">
              <span aria-hidden className="ol-iphone-key" style={{ left: "-0.9%", top: "17%", height: "4%" }} />
              <span aria-hidden className="ol-iphone-key" style={{ left: "-0.9%", top: "24.5%", height: "7.5%" }} />
              <span aria-hidden className="ol-iphone-key" style={{ left: "-0.9%", top: "34%", height: "7.5%" }} />
              <span aria-hidden className="ol-iphone-key" style={{ right: "-0.9%", top: "27%", height: "11.5%" }} />
              <span aria-hidden className="ol-iphone-key" style={{ right: "-0.9%", top: "60%", height: "7%" }} />
              <div className="ol-iphone-bezel">
                <div className="ol-iphone-screen">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div key={stop} className="absolute inset-0 overflow-hidden bg-white"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }}>
                      {screens[stop]}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span aria-hidden className="ol-iphone-island" />
              </div>
            </div>
            <AnimatePresence>
              {shout && (
                <motion.div key={shout} aria-hidden className="absolute top-[13%] -right-[27%] grid w-[46%] place-items-center md:top-[9%] md:right-auto md:-left-[30%]"
                  initial={reduce ? { opacity: 0 } : { scale: 0.3, rotate: -40, opacity: 0 }} animate={{ scale: 1, rotate: -12, opacity: 1 }} exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 420, damping: 15, delay: 0.25 }}>
                  <svg viewBox="-110 -110 220 220" className="col-start-1 row-start-1 w-full overflow-visible">
                    <polygon points={BURST} fill="var(--ink)" transform="translate(7 9)" />
                    <polygon points={BURST} fill="#ffe44d" stroke="var(--ink)" strokeWidth="6" strokeLinejoin="round" />
                  </svg>
                  <span className="ol-shout col-start-1 row-start-1 px-[16%] text-center text-[clamp(0.85rem,1.8vw,1.5rem)] leading-none text-(--ink)">{shout}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.div aria-hidden className="absolute inset-x-0 h-2 origin-left" style={{ top: "calc(100svh - 0.5rem)", scaleX: scrollYProgress, background: "var(--pop-hi)" }} />
      </div>
    </section>
  );
}
