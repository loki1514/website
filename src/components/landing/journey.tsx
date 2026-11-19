"use client";

// The top of the page. A phone stays pinned while the scroll follows one order through OneLocal: the customer orders,
// the partner gets and bills it, the rider delivers it (19 Nov 2026). The first stop is the headline; each stop after it
// shows that person's app. One button, "Become a partner", stays in the same place the whole way through.
// The map behind is that journey too: scrolling slides the map past, each kind of business stands on it as a peak
// ringed by contour lines, and a line of squares between them darkens as the visitor moves on. On screens too narrow
// for that, a small tracker above the words does the same job (tracker.tsx).
//
// Kept light on purpose: text and screens swap with opacity and movement only (no blur), and the pinned area uses
// the small and large viewport heights so a phone browser's address bar sliding away does not make it jump.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Bike, ShoppingBag, Store } from "lucide-react";
import type { LandingCopy } from "@/lib/landing-copy";
import { ContourField, ROUTE_STEP, type Mood, type Route } from "./contour-field";
import { Tracker } from "./tracker";

const EASE = [0.16, 1, 0.3, 1] as const;
// Stops: 0 the headline, 1 customer, 2 partner, 3 rider (how an order flows, 19 Nov 2026).
export const STOPS = 4;
const MOOD: Mood[] = ["day", "sage", "sand", "sage"];
// One icon per stop, in the order the copy lists them: customer, partner, rider.
export const PLACE_ICONS = [ShoppingBag, Store, Bike];
// The app screen in the phone at stops 1 to 3: the customer app, the Partner app, the Rider app.
// Captured from each app on main, running on the live server, on 18 Nov 2026.
const SHOTS = [
  { src: "/shots/customer-app.jpg", alt: "The OneLocal customer app, where people in the city find and order from local businesses" },
  { src: "/shots/partner-app.jpg", alt: "The OneLocal Partner app, where the business gets the order and bills it" },
  { src: "/shots/rider-app.jpg", alt: "The OneLocal Rider app, where the rider picks up and delivers the order" },
];

// How far along the route the visitor is (0 at the first place, 2 at the last) for a scroll position. At each stop
// the map rests at its place while the words are read, then moves on to the next in the second half of the stop.
const placeAt = (progress: number) => {
  const t = Math.min(2, Math.max(0, (progress - 0.25) / 0.25)), whole = Math.floor(t), f = Math.min(1, Math.max(0, (t - whole - 0.5) / 0.5));
  return Math.min(2, whole + f * f * (3 - 2 * f));
};

// The name of a place, standing on the map beside its peak. It rides with the map.
function Place({ index, at, label, on, now, anchor, onJump }: { index: number; at: MotionValue<number>; label: string; on: boolean; now: boolean; anchor: { x: number; y: number }; onJump: (stop: number) => void }) {
  const y = useTransform(at, v => (index - v) * ROUTE_STEP);
  const opacity = useTransform(at, v => Math.max(0, 1 - Math.abs(index - v) / 1.55));
  const Icon = PLACE_ICONS[index];
  return (
    <motion.button type="button" onClick={() => onJump(index + 1)} aria-current={now ? "step" : undefined} className={`ol-place ${on ? "is-on" : ""}`} style={{ left: anchor.x, top: anchor.y, y, opacity }}>
      <span className="ol-place-ico"><Icon aria-hidden /></span>{label}
    </motion.button>
  );
}

export function Journey({ t, cta, onStop, onJump }: { t: LandingCopy["hero"]; cta: string; onStop: (stop: number | null) => void; onJump: (stop: number) => void }) {
  const ref = useRef<HTMLElement>(null);
  // On a phone the handset sits right under the words, however tall they are in this language and on this screen.
  // The words' bottom edge is measured and handed to the stylesheet, which places the handset just below it.
  const words = useRef<HTMLDivElement>(null);
  const handset = useRef<HTMLDivElement>(null);
  // Where the visitor stays on the map: in the open space to the right of the phone, level with its middle. Only on
  // screens wide enough to have that space; otherwise there is no route on the map.
  const pin = useRef<HTMLDivElement>(null);
  const route = useRef<Route | null>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const w = words.current, h = handset.current, p = pin.current;
    if (!w || !h || !p) return;
    const place = () => {
      h.style.setProperty("--under", `${w.offsetTop + w.offsetHeight}px`);
      const frame = p.getBoundingClientRect(), phone = h.getBoundingClientRect();
      const next = window.innerWidth >= 1280 ? { x: Math.round(phone.right - frame.left + 64), y: Math.round(phone.top - frame.top + phone.height / 2) } : null;
      route.current = next && { ...next, at: route.current?.at ?? 0, started: route.current?.started ?? false };
      setAnchor(a => (a?.x === next?.x && a?.y === next?.y ? a : next));
    };
    place();
    const watch = new ResizeObserver(place);
    watch.observe(w); watch.observe(p);
    return () => watch.disconnect();
  }, []);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [stop, setStop] = useState(0);
  const at = useTransform(scrollYProgress, placeAt);
  useMotionValueEvent(scrollYProgress, "change", v => {
    const next = Math.min(STOPS - 1, Math.max(0, Math.floor(v * STOPS)));
    if (route.current) { route.current.at = placeAt(v); route.current.started = next > 0; }
    setStop(next);
    onStop(v >= 0.999 ? null : next);
  });
  // Fetch the later screens once the page has settled, so the first swap to each one is instant.
  useEffect(() => { const timer = setTimeout(() => SHOTS.forEach(s => { new Image().src = s.src; }), 1500); return () => clearTimeout(timer); }, []);
  const lane = stop > 0 ? t.lanes[stop - 1] : null;
  const names = t.lanes.map(l => l.name);
  // A phrase between *stars* takes the green.
  const paint = (text: string) => text.split("*").map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));

  return (
    <section ref={ref} id="journey" data-tone="cream" className="relative" style={{ height: `${STOPS * 100}lvh` }}>
      <div ref={pin} className="sticky top-0 h-lvh overflow-hidden bg-(--cream)">
        <ContourField mood={MOOD[stop]} travel={scrollYProgress} route={route} className="absolute inset-0 size-full" />
        {anchor && names.map((label, i) => <Place key={label} index={i} at={at} label={label} on={stop > i} now={stop === i + 1} anchor={anchor} onJump={onJump} />)}
        <div className="relative mx-auto h-svh w-full max-w-6xl px-5 pt-24 pb-6 md:grid md:grid-cols-[minmax(0,1.2fr)_auto] md:items-center md:gap-x-14 md:px-8 md:pt-28 md:pb-10 lg:px-10">
          <div ref={words} className="relative z-10">
            {/* The compact tracker, for screens with no room for the route on the map. */}
            <Tracker labels={names} stop={stop} progress={scrollYProgress} onJump={onJump} />
            {/* The words change with the stop. Their box keeps one height and they stand on its floor, so the button
                under them never moves. */}
            <div aria-live="polite" className="ol-hero-words">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={stop} initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }} transition={{ duration: 0.4, ease: EASE }}>
                  {lane
                    ? <h2 className="ol-title max-w-[19ch] text-[clamp(1.9rem,3.3vw,2.85rem)]"><em className="mb-1 block">{lane.name}</em>{lane.line}</h2>
                    : <h1 className="ol-title max-w-[12ch] text-[clamp(2.75rem,5.4vw,4.5rem)]">{paint(t.title)}</h1>}
                </motion.div>
              </AnimatePresence>
            </div>
            <Link href="/join" className="ol-pill mt-7 sm:mt-9">{cta}<ArrowRight className="size-5" aria-hidden /></Link>
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
                      {stop === 0 ? (
                        // The One Local app's own opening screen: its logo on its dark green.
                        <div className="grid h-full place-items-center bg-[#0B1A10]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/brand/onelocal-app-icon.png" alt="The One Local app logo" className="w-[44%]" draggable={false} />
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={SHOTS[stop - 1].src} alt={SHOTS[stop - 1].alt} decoding="async" draggable={false} className="block size-full object-cover object-top" />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span aria-hidden className="ol-iphone-island" />
              </div>
            </div>
          </div>
        </div>
        <motion.div aria-hidden className="absolute inset-x-0 h-0.5 origin-left bg-(--chip-on)" style={{ top: "calc(100svh - 2px)", scaleX: scrollYProgress }} />
      </div>
    </section>
  );
}
