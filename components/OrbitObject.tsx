"use client";

import { useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const FACES = ["", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"];

const SPRING = { stiffness: 300, damping: 30 };

function Face({ face, half, burst, border, fill }: {
  face: string;
  half: number;
  burst: MotionValue<number>;
  border: string;
  fill: string;
}) {
  const transform = useTransform(burst, (b) => `${face} translateZ(${half + b * half * 0.9}px)`);
  return (
    <motion.div className="absolute inset-0" style={{ transform, border: `1px solid ${border}`, background: fill }} />
  );
}

function Cube({ size, border, fill, burst, rotateX, rotateY }: {
  size: number;
  border: string;
  fill: string;
  burst: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
}) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
    >
      {FACES.map((face) => (
        <Face key={face || "front"} face={face} half={size / 2} burst={burst} border={border} fill={fill} />
      ))}
    </motion.div>
  );
}

// `boost` lets a parent push the faces apart (or pull them back together) from scroll, on top of the click burst.
export default function OrbitObject({
  size = 340,
  scroll,
  boost,
}: {
  size?: number;
  scroll?: MotionValue<number>;
  boost?: MotionValue<number>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();

  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);
  const fallback = useMotionValue(0);
  const scrolled = useSpring(scroll ?? fallback, SPRING);
  const k = reduced ? 0 : 1;

  // Baseline orientation is driven by scroll; the visitor's drag is a separate offset layered on top.
  const baseX = useTransform(scrolled, [0, 1], [-20, -20 + 240 * k]);
  const baseY = useTransform(scrolled, [0, 1], [25, 25 + 540 * k]);
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);
  const dragRawX = useMotionValue(0);
  const dragRawY = useMotionValue(0);
  const dragX = useSpring(dragRawX, SPRING);
  const dragY = useSpring(dragRawY, SPRING);
  const rotX = useTransform([baseX, dragX, driftX], ([b, d, f]) => (b as number) + (d as number) + (f as number));
  const totalY = useTransform([baseY, dragY, driftY], ([b, d, f]) => (b as number) + (d as number) + (f as number));
  const scale = useTransform(scrolled, [0, 1], [1, 0.7]);

  const leanX = useSpring(0, { stiffness: 120, damping: 14 });
  const leanY = useSpring(0, { stiffness: 120, damping: 14 });
  const burst = useSpring(0, { stiffness: 110, damping: 11 });
  const totalBurst = useTransform([burst, boost ?? fallback], ([b, s]) => (b as number) + (s as number));
  const innerBurst = useTransform(totalBurst, (b) => b * 1.4);

  const drag = useRef({ active: false, x: 0, y: 0, moved: 0 });
  const burstTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [grabbing, setGrabbing] = useState(false);

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return;
    if (!drag.current.active) {
      driftX.set(driftX.get() + delta * 0.002);
      driftY.set(driftY.get() + delta * 0.004);
    }
    innerX.set(innerX.get() - delta * 0.03);
    innerY.set(innerY.get() + delta * 0.022);
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, x: e.clientX, y: e.clientY, moved: 0 };
    setGrabbing(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const d = drag.current;
    if (d.active) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy);
      dragRawY.set(dragRawY.get() + dx * 0.45);
      dragRawX.set(dragRawX.get() - dy * 0.45);
      d.x = e.clientX;
      d.y = e.clientY;
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    leanY.set(((e.clientX - rect.left) / rect.width - 0.5) * 36);
    leanX.set(-((e.clientY - rect.top) / rect.height - 0.5) * 36);
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    setGrabbing(false);
    // Drop whole extra turns first so the cube unwinds the short way, then hand control back to scroll.
    for (const [raw, spring] of [[dragRawX, dragX], [dragRawY, dragY]] as const) {
      const turns = Math.round(raw.get() / 360) * 360;
      raw.set(raw.get() - turns);
      spring.jump(spring.get() - turns);
      raw.set(0);
    }
    if (d.moved < 6) {
      burst.set(1);
      clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => burst.set(0), 420);
    }
  };

  const onPointerLeave = () => {
    leanX.set(0);
    leanY.set(0);
  };

  return (
    <div
      ref={ref}
      aria-hidden
      data-grabbing={grabbing ? "true" : "false"}
      className="relative cursor-grab select-none motion-reduce:cursor-default data-[grabbing=true]:cursor-grabbing"
      style={{ width: size, height: size, perspective: 1400, touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={onPointerLeave}
    >
      <motion.div
        className="absolute inset-0"
        style={{ transformStyle: "preserve-3d", rotateX: leanX, rotateY: leanY, scale }}
      >
        <Cube
          size={size}
          border="color-mix(in srgb, var(--paper) 35%, transparent)"
          fill="linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), color-mix(in srgb, var(--paper) 3%, transparent))"
          burst={totalBurst}
          rotateX={rotX}
          rotateY={totalY}
        />
        <Cube
          size={size / 2}
          border="color-mix(in srgb, var(--accent) 70%, transparent)"
          fill="color-mix(in srgb, var(--accent) 10%, transparent)"
          burst={innerBurst}
          rotateX={innerX}
          rotateY={innerY}
        />
      </motion.div>
    </div>
  );
}
