"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import useReduced from "@/lib/useReduced";

// Scroll-scrubbed arrival from depth: the child rises out of the distance tilted back and faint, settles as it lands,
// then eases back a touch once it has scrolled past the upper third of the screen.
// While it rests (fully arrived, not yet leaving) the transform is exactly "none", so the text is rasterised crisp.
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
  const k = useReduced() ? 0 : 1;
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["start end", "start 60%"] });
  const { scrollYProgress: leave } = useScroll({ target: ref, offset: ["end 45%", "end start"] });
  const transform = useTransform([enter, leave], ([e, l]) => {
    const en = e as number;
    const le = l as number;
    if (!k || (en >= 0.995 && le <= 0.005)) return "none";
    const z = -320 * (1 - en);
    const rx = 14 * (1 - en);
    const tx = x * (1 - en);
    const s = 1 - 0.03 * le;
    return `perspective(1000px) translate3d(${tx.toFixed(2)}px, 0, ${z.toFixed(1)}px) rotateX(${rx.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  });
  const opacity = useTransform([enter, leave], ([e, l]) =>
    k ? Math.min(1, (e as number) / 0.6) * (1 - 0.15 * (l as number)) : 1,
  );
  return (
    <motion.div ref={ref} data-tour-beat="0.55" className={className} style={{ transform, opacity, transformOrigin: "50% 100%" }}>
      {children}
    </motion.div>
  );
}
