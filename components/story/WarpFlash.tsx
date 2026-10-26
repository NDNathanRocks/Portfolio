"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useReduced from "@/lib/useReduced";

// A brief accent glow as you cross from one act into the next: it swells as this marker passes the middle of the
// screen and fades out again. Sits behind the content, so it never lowers text contrast for long.
export default function WarpFlash() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReduced();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, reduced ? 0 : 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0.25, 0.75], [0.7, 1.4]);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none relative h-0">
      <motion.div
        className="absolute inset-x-0 -top-[35vh] -z-10 h-[70vh]"
        style={{
          opacity,
          scale,
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--accent) 40%, transparent), transparent 70%)",
        }}
      />
    </div>
  );
}
