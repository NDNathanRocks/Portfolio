"use client";

import { easeOut } from "@/lib/motion";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  return (
    <span ref={ref} className={`block overflow-hidden pb-[0.08em] ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: inView ? 0 : "110%" }}
        transition={{ duration: 0.7, delay, ease: easeOut }}
      >
        {children}
      </motion.span>
    </span>
  );
}
