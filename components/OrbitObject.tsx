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

const AUTO = { x: 0.012, y: 0.018 };
const MAX_SPEED = 1.2;

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

export default function OrbitObject({ size = 340, scroll }: { size?: number; scroll?: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const reduced = useReducedMotion();

  const rotX = useMotionValue(-20);
  const rotY = useMotionValue(25);
  const innerX = useMotionValue(0);
  const innerY = useMotionValue(0);
  const fallback = useMotionValue(0);
  const scrolled = scroll ?? fallback;
  const totalY = useTransform([rotY, scrolled], ([y, s]) => (y as number) + (s as number) * 540);
  const scale = useTransform(scrolled, [0, 1], [1, 0.7]);

  const leanX = useSpring(0, { stiffness: 120, damping: 14 });
  const leanY = useSpring(0, { stiffness: 120, damping: 14 });
  const burst = useSpring(0, { stiffness: 110, damping: 11 });
  const innerBurst = useTransform(burst, (b) => b * 1.4);

  const velocity = useRef({ x: AUTO.x, y: AUTO.y });
  const drag = useRef({ active: false, x: 0, y: 0, t: 0, moved: 0 });
  const burstTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [grabbing, setGrabbing] = useState(false);

  useAnimationFrame((_, delta) => {
    if (reduced || (!inView && !drag.current.active)) return;
    const v = velocity.current;
    if (!drag.current.active) {
      const ease = Math.min(1, delta * 0.0015);
      v.x += (AUTO.x - v.x) * ease;
      v.y += (AUTO.y - v.y) * ease;
      rotX.set(rotX.get() + v.x * delta);
      rotY.set(rotY.get() + v.y * delta);
    }
    innerX.set(innerX.get() - delta * 0.03);
    innerY.set(innerY.get() + delta * 0.022);
  });

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 };
    setGrabbing(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const d = drag.current;
    if (d.active) {
      const now = performance.now();
      const dt = Math.max(1, now - d.t);
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      d.moved += Math.abs(dx) + Math.abs(dy);
      rotY.set(rotY.get() + dx * 0.45);
      rotX.set(rotX.get() - dy * 0.45);
      const clamp = (n: number) => Math.max(-MAX_SPEED, Math.min(MAX_SPEED, n));
      velocity.current = { x: clamp((-dy * 0.45) / dt), y: clamp((dx * 0.45) / dt) };
      d.x = e.clientX;
      d.y = e.clientY;
      d.t = now;
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
      className="relative select-none"
      style={{
        width: size,
        height: size,
        perspective: 1400,
        touchAction: "pan-y",
        cursor: reduced ? "default" : grabbing ? "grabbing" : "grab",
      }}
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
          border="rgba(244,239,230,0.35)"
          fill="linear-gradient(135deg, rgba(214,255,63,0.07), rgba(244,239,230,0.02))"
          burst={burst}
          rotateX={rotX}
          rotateY={totalY}
        />
        <Cube
          size={size / 2}
          border="rgba(214,255,63,0.7)"
          fill="rgba(214,255,63,0.06)"
          burst={innerBurst}
          rotateX={innerX}
          rotateY={innerY}
        />
      </motion.div>
    </div>
  );
}
