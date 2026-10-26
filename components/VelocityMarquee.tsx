"use client";

import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import useReduced from "@/lib/useReduced";

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export default function VelocityMarquee({
  children,
  speed = 4,
  className = "",
  pauseOnHover = false,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}) {
  const reduced = useReduced();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smooth, [-2000, 0, 2000], [-6, 0, 6], { clamp: false });
  const x = useMotionValue(0);
  const direction = useRef(speed >= 0 ? 1 : -1);
  const paused = useRef(false);

  useAnimationFrame((_, delta) => {
    if (reduced || paused.current || !inView) return;
    const b = boost.get();
    if (b < -0.01) direction.current = speed >= 0 ? -1 : 1;
    else if (b > 0.01) direction.current = speed >= 0 ? 1 : -1;
    const move = direction.current * (Math.abs(speed) + Math.abs(b)) * (delta / 1000);
    x.set(wrap(-50, 0, x.get() - move * 4));
  });

  const translate = useTransform(x, (v) => `${v}%`);

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      onPointerEnter={() => pauseOnHover && (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
    >
      <motion.div className="flex w-max" style={{ x: translate }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
