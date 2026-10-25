"use client";

import { motion, useScroll, useTransform } from "framer-motion";

// The light theme's "sunset": a pale sky that warms from dusk lavender to glowing apricot as you descend, a sun
// glow that lifts away from the hero, and soft clouds drifting at different speeds. Fixed behind everything; invisible
// in dark mode (see `.sky` in globals.css), so dark stays the space theme.
export default function Sky() {
  const { scrollY, scrollYProgress } = useScroll();
  const warm = useTransform(scrollYProgress, [0.1, 0.7], [0, 1]);
  const sunY = useTransform(scrollY, [0, 900], [0, -220]);
  const sunOpacity = useTransform(scrollY, [0, 700, 1400], [1, 0.45, 0]);
  const cloudY = useTransform(scrollY, [0, 3000], [0, -160]);
  return (
    <div aria-hidden className="sky pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, var(--sky-a) 0%, transparent 70%)" }} />
      <motion.div
        className="absolute inset-0"
        style={{ opacity: warm, background: "linear-gradient(180deg, var(--sky-b) 0%, transparent 70%)" }}
      />
      <motion.div
        className="absolute right-[8%] top-[30%] h-[70vmin] w-[70vmin] rounded-full"
        style={{
          y: sunY,
          opacity: sunOpacity,
          background: "radial-gradient(circle, var(--sun) 0%, color-mix(in srgb, var(--sun) 35%, transparent) 30%, transparent 68%)",
        }}
      />
      <motion.div className="absolute inset-0" style={{ y: cloudY }}>
        <span className="cloud absolute left-[-20%] top-[18%] h-[22vmin] w-[55vmin] [animation-duration:140s]" />
        <span className="cloud absolute left-[-35%] top-[42%] h-[18vmin] w-[70vmin] [animation-duration:200s] [animation-delay:-80s]" />
        <span className="cloud absolute left-[-10%] top-[68%] h-[26vmin] w-[60vmin] [animation-duration:170s] [animation-delay:-40s]" />
      </motion.div>
    </div>
  );
}
