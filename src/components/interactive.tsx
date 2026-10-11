"use client";

// The playful parts of the landing page: a call-to-action that leans toward the cursor, and a hands-on demo of
// what a new OneLocal order feels like for a partner (ring, accept, then the rider's trip to the door).
// The demo is labelled as a demo and uses sample items; nothing here is a live order.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Check } from "lucide-react";
import { MagneticButton } from "@/components/magnetic-button";
import { OrderTracker, type TrackingStop } from "@/components/order-tracker";
import { ConfettiButton, type ConfettiControls } from "@/components/confetti-button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMascot } from "@/components/mascot";
import { cn } from "@/lib/utils";

export function MagneticCta({ href = "/join", children, className }: { href?: string; children: React.ReactNode; className?: string }) {
  const router = useRouter(); const { react } = useMascot();
  return (
    <MagneticButton onMouseEnter={() => react("excited", 1500)} onClick={() => router.push(href)} className={cn("neon-glow h-14 rounded-full bg-primary px-8 text-base font-extrabold text-primary-foreground", className)}>
      {children}
    </MagneticButton>
  );
}

const STOPS: TrackingStop[] = [
  { label: "Order accepted", detail: "You accepted it on the partner app" },
  { label: "Packed", detail: "Kitchen ticket printed, order packed" },
  { label: "Rider picked up", detail: "A OneLocal rider collected it" },
  { label: "Out for delivery", detail: "On the way through Ganj Golai" },
  { label: "Delivered", detail: "Handed over at the door" },
];

export function DemoOrder() {
  const reduce = useReducedMotion(); const { react } = useMascot();
  const [phase, setPhase] = useState<"ringing" | "tracking">("ringing");
  const [stop, setStop] = useState(0);
  const confetti = useRef<ConfettiControls>(null);
  const started = useRef(new Date());

  useEffect(() => {
    if (phase !== "tracking" || stop >= STOPS.length - 1) return;
    const id = setTimeout(() => setStop(s => s + 1), reduce ? 400 : 1400);
    return () => clearTimeout(id);
  }, [phase, stop, reduce]);
  useEffect(() => { if (stop === STOPS.length - 1) { react("celebrate", 5000); confetti.current?.hold({ haptics: false }); confetti.current?.release({ charge: 0.8 }); } }, [stop]);

  const at = (i: number) => new Date(started.current.getTime() + i * 6 * 60_000).toISOString();
  const reset = () => { setPhase("ringing"); setStop(0); started.current = new Date(); };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
      <div className="relative mx-auto w-full max-w-[340px] rounded-[2.4rem] border-[9px] border-neutral-950 bg-[oklch(0.97_0.01_120)] p-4 text-neutral-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="mb-4 flex items-center justify-between text-xs font-semibold text-neutral-500"><span>VINII Partner</span><span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-white">DEMO</span></div>
        <AnimatePresence mode="wait">
          {phase === "ringing" ? (
            <motion.div key="ring" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3">
                <motion.span animate={reduce ? {} : { rotate: [0, -16, 14, -10, 8, 0] }} transition={{ repeat: Infinity, duration: 1.1, repeatDelay: 0.6 }} className="grid size-11 place-items-center rounded-2xl bg-[oklch(0.9_0.24_128)]"><Bell className="size-5" /></motion.span>
                <div><p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">New order · OL-00042</p><p className="text-lg font-extrabold">₹ 468 · Cash</p></div>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm">
                <li className="flex justify-between"><span>2 × Classic Cheeseburger</span><span>₹ 258</span></li>
                <li className="flex justify-between"><span>1 × Loaded Cheese Fries</span><span>₹ 149</span></li>
                <li className="flex justify-between text-neutral-500"><span>Delivery to Ausa Road</span><span>₹ 61</span></li>
              </ul>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-neutral-100"><motion.div className="h-full bg-[oklch(0.75_0.2_128)]" initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 60, ease: "linear" }} /></div>
              <p className="mt-1.5 text-[11px] text-neutral-500">Accept within 60 seconds</p>
              <button type="button" onClick={() => { setPhase("tracking"); react("happy", 3000); }} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 text-base font-extrabold text-[oklch(0.9_0.24_128)] transition-transform hover:scale-[1.02] active:scale-[0.97]">
                <Check className="size-5" />Accept order
              </button>
            </motion.div>
          ) : (
            <motion.div key="track" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <OrderTracker orderId="OL-00042" stops={STOPS.map((s, i) => (i <= stop ? { ...s, at: at(i) } : s))} current={stop} eta={at(STOPS.length - 1)} timeZone="Asia/Kolkata" className="w-full" />
              {stop === STOPS.length - 1 && <button type="button" onClick={reset} className="w-full rounded-2xl border border-neutral-200 py-2.5 text-sm font-semibold">Try again</button>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        <p className="font-mono text-xs tracking-widest text-primary uppercase">Try it</p>
        <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] sm:text-6xl">This is what an order <span className="neon">feels like.</span></h2>
        <p className="mt-5 max-w-md text-lg text-muted-foreground">The partner app rings, you tap accept, and you can follow the order to the customer&apos;s door. Go on, accept it.</p>
        <div className="mt-8 [&_*]:!text-base">
          <ConfettiButton controls={confetti} hint={null} className="justify-start rounded-full">Celebrate the first order</ConfettiButton>
        </div>
      </div>
    </div>
  );
}
