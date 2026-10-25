"use client";

import { motion, useScroll, useTransform } from "framer-motion";

// One fixed vignette over the starfield (under the content). It closes in during the dive and corridor, and opens up for the landing.
export default function Fog() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.12, 0.25, 0.55, 0.85, 1], [0.45, 0.9, 0.8, 0.35, 0.15, 0.1]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity, background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, var(--ink) 100%)" }}
    />
  );
}
