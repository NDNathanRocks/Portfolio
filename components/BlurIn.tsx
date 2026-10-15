"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeOut } from "@/lib/motion";

// Staggered blur-to-focus reveal, one word at a time, on viewport entry.
export default function BlurIn({ text, className = "" }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.04, ease: easeOut }}
        >
          {i > 0 ? ` ${w}` : w}
        </motion.span>
      ))}
    </span>
  );
}
