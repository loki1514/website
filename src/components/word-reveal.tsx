"use client";

import { Fragment, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

// A sentence that lights up word by word as the page scrolls past it (the page's own scroll, not a scroll box inside it,
// so nobody has to discover that it can be scrolled). With Reduce Motion every word is simply readable.
const DIM = 0.28;

export function WordReveal({ text, className }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (reduce) { spans.forEach(s => { s.style.opacity = "1"; }); return; }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the sentence's top is 85% down the screen, 1 when its bottom is 60% down.
      const start = vh * 0.85, end = vh * 0.6;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const n = spans.length;
      spans.forEach((s, i) => {
        const t = Math.min(1, Math.max(0, p * (n + 3) - i));
        s.style.opacity = String(DIM + (1 - DIM) * t);
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [reduce, text]);

  return (
    <p ref={root} className={cn(className)}>
      {words.map((w, i) => (
        <Fragment key={i}><span data-w style={{ opacity: DIM }} className="transition-opacity duration-150">{w}</span>{" "}</Fragment>
      ))}
    </p>
  );
}
