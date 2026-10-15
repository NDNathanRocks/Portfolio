"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { snap } from "@/lib/motion";

// Pulls its child toward the cursor by at most `max` px. Fine-pointer hover devices only.
export default function Magnetic({
  children,
  max = 5,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, snap);
  const y = useSpring(my, snap);

  const move = (e: React.PointerEvent) => {
    if (reduced || e.pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    mx.set(Math.max(-1, Math.min(1, dx)) * max);
    my.set(Math.max(-1, Math.min(1, dy)) * max);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <span className={`inline-block ${className}`} onPointerMove={move} onPointerLeave={reset}>
      <motion.span ref={ref} className="inline-block" style={{ x, y }}>
        {children}
      </motion.span>
    </span>
  );
}
