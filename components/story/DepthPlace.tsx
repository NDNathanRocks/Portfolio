"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// Scroll-scrubbed arrival from depth: the child rises out of the distance tilted back and faint, settles as it lands,
// then sinks back and dims once it has scrolled past the upper third of the screen.
export default function DepthPlace({
  x = 0,
  children,
  className = "",
}: {
  x?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const k = useReducedMotion() ? 0 : 1;
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 60%"] });
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end 45%", "end start"] });
  const z = useTransform(enter, [0, 1], [-320 * k, 0]);
  const rotateX = useTransform(enter, [0, 1], [14 * k, 0]);
  const tx = useTransform(enter, [0, 1], [x * k, 0]);
  const scale = useTransform(leave, [0, 1], [1, 1 - 0.06 * k]);
  const opacity = useTransform([enter, leave], ([e, l]) =>
    k ? Math.min(1, (e as number) / 0.6) * (1 - 0.5 * (l as number)) : 1,
  );
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: tx, z, rotateX, scale, opacity, transformPerspective: 1000, transformOrigin: "50% 100%" }}
    >
      {children}
    </motion.div>
  );
}
