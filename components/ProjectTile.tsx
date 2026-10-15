"use client";

import { easeDrawer, snap } from "@/lib/motion";
import { spotlightMove } from "@/lib/spotlight";
import Decode from "./Decode";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import type { Project } from "@/lib/content";

const MotionLink = motion.create(Link);

// Each tile arrives from a different corner, spinning slightly, scrubbed by scroll.
const FLY = [
  { x: -110, y: 90, r: -4 },
  { x: 110, y: 60, r: 3.5 },
  { x: -70, y: 120, r: 2.5 },
  { x: 90, y: 110, r: -3 },
];

export default function ProjectTile({ project, index }: { project: Project; index: number }) {
  const { id, title, subtitle, meta, stack, from, to, origin, layout, titleClass } = project;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [calm, setCalm] = useState(false);
  const [amp, setAmp] = useState(1);
  useEffect(() => {
    setCalm(!!reduced);
    setAmp(reduced ? 0 : window.matchMedia("(min-width: 768px)").matches ? 1 : 0.3);
  }, [reduced]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: enter } = useScroll({ target: ref, offset: ["0.25 end", "start 50%"] });
  const fly = FLY[index % FLY.length];
  const x = useTransform(enter, [0, 1], [fly.x * amp, 0]);
  const y = useTransform(enter, [0, 1], [fly.y * amp, 0]);
  const rotate = useTransform(enter, [0, 1], [fly.r * amp, 0]);
  const scale = useTransform(enter, [0, 1], [1 - 0.06 * amp, 1]);
  const opacity = useTransform(enter, [0, 0.5], [calm ? 1 : 0, 1]);
  const artY = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [-36, 36]);

  const wash: Variants = {
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  };
  const art: Variants = { rest: { scale: 1 }, hover: { scale: 1.05, transition: snap } };
  const arrow: Variants = { rest: { x: 0, y: 0 }, hover: { x: 4, y: -4 } };

  return (
    <motion.div
      ref={ref}
      style={{ x, y, rotate, scale, opacity }}
      className={layout}
    >
      <MotionLink
        href={`/projects/${id}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        aria-label={`${title}: ${subtitle}. Open project page`}
        onPointerMove={spotlightMove}
        className="group surface spotlight relative block h-full min-h-[300px] overflow-hidden rounded-sm bg-s1 md:min-h-0"
      >
        <motion.div aria-hidden className="absolute -inset-10" style={{ y: artY }}>
          <motion.div
            variants={art}
            transition={snap}
            className="h-full w-full"
            style={{ background: `radial-gradient(circle at ${origin}, ${from}40, transparent 65%)` }}
          />
        </motion.div>
        <motion.div
          aria-hidden
          variants={wash}
          transition={{ duration: 0.5, ease: easeDrawer }}
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-6 transition-colors duration-300 group-hover:text-[#0a0a0a] group-focus-visible:text-[#0a0a0a] md:p-7">
          <div className="flex items-start justify-between gap-4 font-mono text-xs uppercase tracking-[0.14em]">
            <Decode text={meta} />
            <motion.span aria-hidden variants={arrow} transition={snap} className="text-lg leading-none">
              ↗
            </motion.span>
          </div>
          <div>
            <h3 className={`font-display font-medium leading-[0.92] tracking-[-0.03em] ${titleClass}`}>{title}</h3>
            <p className="mt-3 max-w-[40ch] text-base opacity-80 md:text-lg">{subtitle}</p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs uppercase tracking-[0.14em] opacity-70">
              {stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </MotionLink>
    </motion.div>
  );
}
