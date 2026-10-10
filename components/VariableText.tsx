"use client";

import { useMemo } from "react";
import {
  motion,
  motionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type Axes = { wght: number; wdth: number };

type Props = {
  text: string;
  rest: Axes;
  peak: Axes;
  className?: string;
  falloff?: number[];
};

function Letter({
  char,
  level,
  rest,
  peak,
}: {
  char: string;
  level: MotionValue<number>;
  rest: Axes;
  peak: Axes;
}) {
  const spring = useSpring(level, { stiffness: 220, damping: 20, mass: 0.5 });
  const fontVariationSettings = useTransform(spring, (v) => {
    const wght = Math.round(rest.wght + (peak.wght - rest.wght) * v);
    const wdth = Math.round(rest.wdth + (peak.wdth - rest.wdth) * v);
    return `"wght" ${wght}, "wdth" ${wdth}`;
  });
  const y = useTransform(spring, (v) => -v * 6);

  return (
    <motion.span className="inline-block" style={{ fontVariationSettings, y }}>
      {char}
    </motion.span>
  );
}

export default function VariableText({
  text,
  rest,
  peak,
  className = "",
  falloff = [1, 0.55, 0.2],
}: Props) {
  const reduced = useReducedMotion();
  const levels = useMemo(
    () => Array.from({ length: text.length }, () => motionValue(0)),
    [text.length],
  );

  const activate = (index: number) => {
    if (reduced) return;
    levels.forEach((level, i) => level.set(falloff[Math.abs(i - index)] ?? 0));
  };
  const reset = () => levels.forEach((level) => level.set(0));

  let cursor = 0;
  const words = text.split(" ").map((word) => {
    const start = cursor;
    cursor += word.length + 1;
    return { word, start };
  });

  return (
    <span className="block">
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`flex flex-wrap ${className}`} onPointerLeave={reset}>
        {words.map(({ word, start }, w) => (
          <span key={start} className="inline-flex whitespace-nowrap">
            {word.split("").map((char, i) => (
              <span key={i} onPointerEnter={() => activate(start + i)} className="inline-block">
                <Letter char={char} level={levels[start + i]} rest={rest} peak={peak} />
              </span>
            ))}
            {w < words.length - 1 && <span className="inline-block w-[0.28em]" />}
          </span>
        ))}
      </span>
    </span>
  );
}
