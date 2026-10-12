"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

// A muted, looping clip that only plays while on screen, and holds a still frame for Reduce Motion.
export function LoopVideo({ src, className, label }: { src: string; className?: string; label?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) { v.pause(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); }, { threshold: 0.15 });
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  const poster = src.replace(/\/video\/(\w+)\.mp4$/, "/video/poster/$1.jpg");
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} aria-hidden={!label} className={cn("h-full w-full object-cover", className)} />;
}

// A phone outline around an app screenshot. The screenshot sits below a strip with the camera notch, so the notch never covers the app's own header.
// Pass `video` to play a muted looping app clip instead of a still screenshot (same frame, same poster convention as LoopVideo).
export function Phone({ src, video, alt, className }: { src?: string; video?: string; alt: string; className?: string }) {
  return (
    <div className={cn("relative aspect-[9/19.5] rounded-[2.6rem] border-[9px] border-neutral-950 bg-neutral-950 pt-7 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.08)]", className)}>
      <div className="absolute top-1.5 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900 ring-1 ring-white/10" />
      {video
        ? <LoopVideo src={video} label={alt} className="rounded-t-lg rounded-b-[2rem] object-top" />
        : /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt={alt} className="h-full w-full rounded-t-lg rounded-b-[2rem] object-cover object-top" />}
    </div>
  );
}
