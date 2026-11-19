"use client";

// The compact tracker of the journey, for screens too narrow to show the route on the map beside the phone (see
// journey.tsx). Three equal segments, one per kind of business, each a fine bar with its icon and name under it. A
// segment fills as its part of the journey is scrolled through, so the bar reads like the progress of a story; the
// kind being shown stands at full strength. Each can be tapped to jump to that part.
import { motion, useTransform, type MotionValue } from "motion/react";
import { PLACE_ICONS } from "./journey";

function Segment({ i, n, label, now, progress, onJump }: { i: number; n: number; label: string; now: boolean; progress: MotionValue<number>; onJump: (stop: number) => void }) {
  // The journey has n + 1 stops (the headline, then one per kind); segment i fills during stop i + 1.
  const fill = useTransform(progress, v => Math.min(1, Math.max(0, v * (n + 1) - (i + 1))));
  const Icon = PLACE_ICONS[i];
  return (
    <button type="button" onClick={() => onJump(i + 1)} aria-current={now ? "step" : undefined} className="ol-track-seg">
      <span aria-hidden className="ol-track-bar"><motion.i style={{ scaleX: fill }} /></span>
      <span className="ol-track-name"><Icon aria-hidden />{label}</span>
    </button>
  );
}

// `stop` is the journey's stop (0 the headline, then one per label); `progress` is the scroll through the journey, 0 to 1.
export function Tracker({ labels, stop, progress, onJump }: { labels: string[]; stop: number; progress: MotionValue<number>; onJump: (stop: number) => void }) {
  return (
    <nav aria-label={labels.join(", ")} className="ol-track">
      {labels.map((label, i) => <Segment key={label} i={i} n={labels.length} label={label} now={stop === i + 1} progress={progress} onJump={onJump} />)}
    </nav>
  );
}
