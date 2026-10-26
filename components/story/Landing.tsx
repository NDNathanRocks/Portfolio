"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import OrbitObject from "../OrbitObject";
import useReduced from "@/lib/useReduced";

// Act 6. The lime contact block opens like an aperture from its top edge, and the cube that burst apart in the hero
// pulls its faces back together and settles in the corner.
export default function Landing({ id, className = "", children }: { id: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const k = useReduced() ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 45%"] });
  const radius = useTransform(scrollYProgress, [0, 1], [k ? 4 : 150, 150]);
  const clipPath = useTransform(radius, (r) => (r >= 150 ? "none" : `circle(${r}% at 50% 0%)`));
  return (
    <motion.section ref={ref} id={id} data-act="landing" className={className} style={{ clipPath }}>
      {children}
    </motion.section>
  );
}

export function LandingCube() {
  const ref = useRef<HTMLDivElement>(null);
  const k = useReduced() ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const boost = useTransform(scrollYProgress, [0, 1], [3 * k, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [k ? 0 : 1, 1]);
  return (
    // Inside the lime block the cube is drawn in ink: its colours come from --accent and --paper, so remap both here.
    <motion.div
      ref={ref}
      style={{ opacity, "--accent": "var(--ink)", "--paper": "var(--ink)" } as React.ComponentProps<typeof motion.div>["style"]}
    >
      <OrbitObject size={110} scroll={scrollYProgress} boost={boost} />
    </motion.div>
  );
}
