"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Scroll-scrubbed entrance: the child glides into place as it rises through the viewport, and back out if you scroll up.
export default function ScrollPlace({
  x = 0,
  y = 0,
  rotate = 0,
  children,
  className = "",
}: {
  x?: number;
  y?: number;
  rotate?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const k = reduced ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 65%"] });
  const tx = useTransform(scrollYProgress, [0, 1], [x * k, 0]);
  const ty = useTransform(scrollYProgress, [0, 1], [y * k, 0]);
  const tr = useTransform(scrollYProgress, [0, 1], [rotate * k, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [reduced ? 1 : 0, 1]);
  return (
    <motion.div ref={ref} className={className} style={{ x: tx, y: ty, rotate: tr, opacity }}>
      {children}
    </motion.div>
  );
}
