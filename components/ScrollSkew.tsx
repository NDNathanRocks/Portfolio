"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity } from "framer-motion";
import useReduced from "@/lib/useReduced";

// Leans its children a hair against the scroll direction, proportional to scroll speed (max 2deg), and settles when you stop.
export default function ScrollSkew({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduced = useReduced();
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { stiffness: 300, damping: 50 });
  const skewY = useTransform(velocity, [-2500, 2500], reduced ? [0, 0] : [2, -2], { clamp: true });
  return (
    <motion.div className={className} style={{ skewY, willChange: "transform" }}>
      {children}
    </motion.div>
  );
}
