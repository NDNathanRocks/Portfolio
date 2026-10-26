"use client";

import { motion, type Variants } from "framer-motion";
import { snap } from "@/lib/motion";
import { ascend } from "@/lib/scroll";

const arrow: Variants = { rest: { y: 0 }, hover: { y: -4 } };

// "Back to the surface": climbs the whole story in reverse to the hero. Without JS or with reduced motion
// (no Lenis) it is a plain jump to #top.
export default function Ascent({ className = "" }: { className?: string }) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // detail is 0 for Enter on a focused link: only keyboard users need focus carried up (it draws a ring).
    const keyboard = e.detail === 0;
    const started = ascend(() => {
      if (keyboard) document.getElementById("hero-title")?.focus({ preventScroll: true });
      else (document.activeElement as HTMLElement | null)?.blur();
    });
    if (!started) return;
    e.preventDefault();
    // Lenis' own anchor handler sits on window and would start a second, lerped scroll.
    e.stopPropagation();
  };
  return (
    <motion.a href="#top" onClick={onClick} initial="rest" whileHover="hover" whileFocus="hover" className={className}>
      Back to the surface
      <motion.span aria-hidden variants={arrow} transition={snap} className="ml-2 inline-block">
        &uarr;
      </motion.span>
    </motion.a>
  );
}
