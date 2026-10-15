"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

// Choreographed entrance for project-page content: opacity + 12px rise, staggered by `step`.
export default function Enter({
  step = 0,
  children,
  className = "",
}: {
  step?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: step * 0.07, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
