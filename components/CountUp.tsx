"use client";

import { easeOut } from "@/lib/motion";
import { useEffect, useLayoutEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import useReduced from "@/lib/useReduced";

export default function CountUp({
  value,
  prefix = "",
  suffix = "",
  className = "tabular-nums",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReduced();

  useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = `${prefix}${reduced ? value : 0}${suffix}`;
  }, [reduced, value, prefix, suffix]);

  useEffect(() => {
    const node = ref.current;
    if (!node || !inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: easeOut,
      onUpdate: (v) => {
        node.textContent = `${prefix}${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {`${prefix}${value}${suffix}`}
    </span>
  );
}
