"use client";

import { easeDrawer, easeOut, snap } from "@/lib/motion";
import { spotlightMove } from "@/lib/spotlight";
import Decode from "./Decode";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import type { Project } from "@/lib/content";

const ease = easeOut;
const MotionLink = motion.create(Link);

export default function ProjectTile({ project, index }: { project: Project; index: number }) {
  const { id, title, subtitle, meta, stack, from, to, origin, layout, titleClass } = project;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [calm, setCalm] = useState(false);
  useEffect(() => setCalm(!!reduced), [reduced]);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], calm ? [0, 0] : [-36, 36]);

  const wash: Variants = {
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  };
  const ink: Variants = { rest: { color: "#f4efe6" }, hover: { color: "#0a0a0a" } };
  const art: Variants = { rest: { scale: 1 }, hover: { scale: 1.05, transition: snap } };
  const arrow: Variants = { rest: { x: 0, y: 0 }, hover: { x: 4, y: -4 } };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.07, ease }}
      className={layout}
    >
      <MotionLink
        href={`/projects/${id}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        aria-label={`${title}: ${subtitle}. Open project page`}
        onPointerMove={spotlightMove}
        className="surface spotlight relative block h-full min-h-[300px] overflow-hidden rounded-sm bg-[#111] md:min-h-0"
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
        <motion.div
          variants={ink}
          transition={{ duration: 0.3, ease: easeDrawer }}
          className="relative z-10 flex h-full flex-col justify-between p-6 md:p-7"
        >
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
        </motion.div>
      </MotionLink>
    </motion.div>
  );
}
