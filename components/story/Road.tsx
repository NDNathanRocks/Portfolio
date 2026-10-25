"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

// The Experience timeline as a road seen from above, receding downwards to a vanishing point (the origin of the route).
// `progress` fills the centre line as you travel; `scroll` makes the dashes stream past. Desktop only: phones keep the thin line.
export default function Road({ progress, scroll }: { progress: MotionValue<number>; scroll: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const dashOffset = useTransform(scroll, [0, 1], [0, reduced ? 0 : 320]);
  return (
    <div aria-hidden className="absolute bottom-0 left-[-34px] top-0 hidden w-[68px] md:block">
      <svg viewBox="0 0 68 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <polygon points="0,0 68,0 40,100 28,100" className="fill-paper/[0.06]" />
        <line x1="0" y1="0" x2="28" y2="100" vectorEffect="non-scaling-stroke" className="stroke-paper/25" strokeWidth="1" />
        <line x1="68" y1="0" x2="40" y2="100" vectorEffect="non-scaling-stroke" className="stroke-paper/25" strokeWidth="1" />
        <motion.line
          x1="34"
          y1="0"
          x2="34"
          y2="100"
          vectorEffect="non-scaling-stroke"
          className="stroke-paper/30"
          strokeWidth="2"
          strokeDasharray="8 12"
          style={{ strokeDashoffset: dashOffset }}
        />
        <motion.line
          x1="34"
          y1="0"
          x2="34"
          y2="100"
          vectorEffect="non-scaling-stroke"
          className="stroke-accent"
          strokeWidth="2"
          pathLength={1}
          style={{ pathLength: progress }}
        />
      </svg>
    </div>
  );
}
