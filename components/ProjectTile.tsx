"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import type { Project } from "@/lib/content";

const ease = [0.2, 0.7, 0.2, 1] as const;
const MotionLink = motion.create(Link);

export default function ProjectTile({ project, index }: { project: Project; index: number }) {
  const { id, title, subtitle, meta, stack, from, to, origin, layout, titleClass } = project;
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-36, 36]);

  const wash: Variants = {
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  };
  const ink: Variants = { rest: { color: "#f4efe6" }, hover: { color: "#0a0a0a" } };
  const art: Variants = { rest: { scale: 1 }, hover: { scale: 1.08 } };
  const arrow: Variants = { rest: { x: 0, y: 0 }, hover: { x: 4, y: -4 } };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 3) * 0.1, ease }}
      className={layout}
    >
      <MotionLink
        href={`/projects/${id}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        aria-label={`${title}: ${subtitle}. Open project page`}
        className="relative block h-full min-h-[300px] overflow-hidden rounded-sm border border-paper/10 bg-[#111] md:min-h-0"
      >
        <motion.div aria-hidden className="absolute -inset-10" style={{ y: artY }}>
          <motion.div
            variants={art}
            transition={{ duration: 0.9, ease }}
            className="h-full w-full"
            style={{ background: `radial-gradient(circle at ${origin}, ${from}40, transparent 65%)` }}
          />
        </motion.div>
        <motion.div
          aria-hidden
          variants={wash}
          transition={{ duration: 0.8, ease }}
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
        <motion.div
          variants={ink}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex h-full flex-col justify-between p-6 md:p-7"
        >
          <div className="flex items-start justify-between gap-4 font-mono text-xs uppercase tracking-[0.14em]">
            <span>{meta}</span>
            <motion.span aria-hidden variants={arrow} transition={{ duration: 0.5, ease }} className="text-lg leading-none">
              &nearr;
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
