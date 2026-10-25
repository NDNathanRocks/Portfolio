"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { captions } from "@/lib/story";

// Act 2 layers drawn over the pinned hero: light floods out of the cube as the camera passes through it, then the caption.
export default function HeroDive({ progress }: { progress: MotionValue<number> }) {
  const glowOpacity = useTransform(progress, [0.55, 0.76, 0.95], [0, 0.6, 0]);
  const glowScale = useTransform(progress, [0.55, 0.95], [0.4, 2.2]);
  const captionOpacity = useTransform(progress, [0.72, 0.82, 0.96, 1], [0, 1, 1, 0]);
  const captionY = useTransform(progress, [0.72, 1], [48, -48]);
  const captionScale = useTransform(progress, [0.72, 1], [0.9, 1.05]);
  const kickerSpacing = useTransform(progress, [0.72, 0.9], ["0.6em", "0.14em"]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          opacity: glowOpacity,
          scale: glowScale,
          background: "radial-gradient(circle at 50% 50%, var(--accent) 0%, color-mix(in srgb, var(--accent) 30%, transparent) 22%, transparent 55%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity: captionOpacity, y: captionY, scale: captionScale }}
      >
        <motion.p className="font-mono text-xs uppercase text-accent" style={{ letterSpacing: kickerSpacing }}>
          {captions.dive.kicker}
        </motion.p>
        <p className="mt-5 font-display text-[clamp(2.5rem,6vw,5.5rem)] font-light leading-[0.95] tracking-[-0.035em]">
          {captions.dive.line}
        </p>
      </motion.div>
    </>
  );
}
