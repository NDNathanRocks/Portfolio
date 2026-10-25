"use client";

import { useRef } from "react";
import { useScroll, type MotionValue } from "framer-motion";

// A tall track with a sticky one-screen stage inside. Scrolling the track scrubs `progress` from 0 to 1 while the stage stays pinned.
export default function StoryScene({
  vh,
  act,
  className = "",
  stageClassName = "",
  children,
}: {
  vh: number;
  act?: string;
  className?: string;
  stageClassName?: string;
  children: (progress: MotionValue<number>) => React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  return (
    <div ref={ref} data-act={act} className={`relative ${className}`} style={{ height: `${vh}vh` }}>
      <div className={`sticky top-0 h-screen overflow-hidden ${stageClassName}`}>{children(scrollYProgress)}</div>
    </div>
  );
}
