"use client";

import { easeDrawer, snap } from "@/lib/motion";
import { spotlightMove } from "@/lib/spotlight";
import Decode from "../Decode";
import StoryScene from "./StoryScene";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValueEvent, useTransform, type MotionValue, type Variants } from "framer-motion";
import { projects, type Project } from "@/lib/content";
import { corridorGap, pin } from "@/lib/story";

const MotionLink = motion.create(Link);
const mono = "font-mono text-xs uppercase tracking-[0.14em]";
const count = projects.length;
const pad = (n: number) => String(n).padStart(2, "0");

// Which card the camera is at: -0.5 before the first, count - 0.6 as the last one passes.
const focusAt = (p: number) => p * (count - 0.1) - 0.5;

function Card({ project, index, focus, onFocusCard }: {
  project: Project;
  index: number;
  focus: MotionValue<number>;
  onFocusCard: (i: number) => void;
}) {
  const { id, title, subtitle, meta, stack, from, to, origin, liveUrl } = project;
  const side = index % 2 === 0 ? -1 : 1;
  // t is this card's distance from the camera in card-gaps: negative = still ahead, 0 = in focus, positive = flying past.
  const t = useTransform(focus, (f) => f - index);
  const z = useTransform(t, (v) => v * corridorGap);
  const x = useTransform(t, [-3, 0, 1], [`${side * 8}vw`, `${side * 20}vw`, `${side * 48}vw`]);
  const rotateY = useTransform(t, [-3, 0, 1], [side * -4, side * -8, side * -24]);
  const opacity = useTransform(t, [-3, -1.4, -0.2, 0.25, 0.7], [0, 0.45, 1, 1, 0]);
  const blur = useTransform(t, [-3, -1, -0.25, 0.2, 0.7], [10, 4, 0, 0, 6]);
  const filter = useTransform(blur, (b) => (b < 0.2 ? "none" : `blur(${b.toFixed(1)}px)`));
  const pointerEvents = useTransform(t, (v) => (Math.abs(v) < 0.45 ? "auto" : "none"));

  const wash: Variants = {
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  };
  const arrow: Variants = { rest: { x: 0, y: 0 }, hover: { x: 4, y: -4 } };

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 h-[min(62vh,560px)] w-[min(44vw,620px)] -translate-x-1/2 -translate-y-1/2"
      style={{ x, z, rotateY, opacity, filter, pointerEvents }}
    >
      <MotionLink
        href={`/projects/${id}`}
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        onFocus={() => onFocusCard(index)}
        aria-label={`${title}: ${subtitle}. Open project page`}
        onPointerMove={spotlightMove}
        className="group surface spotlight relative block h-full overflow-hidden rounded-sm bg-s1 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.7)]"
      >
        <div
          aria-hidden
          className="absolute -inset-10"
          style={{ background: `radial-gradient(circle at ${origin}, ${from}55, transparent 65%)` }}
        />
        <motion.div
          aria-hidden
          variants={wash}
          transition={{ duration: 0.5, ease: easeDrawer }}
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-7 transition-colors duration-300 group-hover:text-[#0a0a0a] group-focus-visible:text-[#0a0a0a] md:p-9">
          <div className={`flex items-start justify-between gap-4 ${mono}`}>
            <span className="flex items-center gap-2">
              {liveUrl && <span aria-hidden className="h-2 w-2 rounded-full bg-accent motion-safe:animate-pulse group-hover:bg-[#0a0a0a]" />}
              {meta}
            </span>
            <motion.span aria-hidden variants={arrow} transition={snap} className="text-lg leading-none">
              ↗
            </motion.span>
          </div>
          <div>
            <p aria-hidden className="font-display text-[clamp(4rem,7vw,7rem)] font-light leading-none tracking-[-0.05em] opacity-15">
              {pad(index + 1)}
            </p>
            <h3 className="mt-2 font-display text-[clamp(2.25rem,3.6vw,3.75rem)] font-medium leading-[0.92] tracking-[-0.03em]">{title}</h3>
            <p className="mt-3 max-w-[40ch] text-base opacity-80 md:text-lg">{subtitle}</p>
            <ul className={`mt-5 flex flex-wrap gap-x-4 gap-y-1 opacity-70 ${mono}`}>
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

function Floor({ progress }: { progress: MotionValue<number> }) {
  const backgroundPositionY = useTransform(progress, (p) => `${p * count * 520}px`);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 [perspective:600px]">
      <motion.div
        className="absolute bottom-0 left-1/2 h-[220%] w-[320%] -translate-x-1/2 origin-bottom opacity-40 [mask-image:linear-gradient(to_top,black,transparent_75%)]"
        style={{
          rotateX: 78,
          backgroundPositionY,
          backgroundImage:
            "linear-gradient(to right, color-mix(in srgb, var(--paper) 18%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--paper) 18%, transparent) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />
    </div>
  );
}

function Hud({ progress, focus }: { progress: MotionValue<number>; focus: MotionValue<number> }) {
  const [active, setActive] = useState(0);
  useMotionValueEvent(focus, "change", (f) => {
    setActive(Math.max(0, Math.min(count - 1, Math.round(f))));
  });
  const project = projects[active];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 px-14 pb-10 ${mono}`}>
      <div>
        <p className="text-accent">
          {pad(active + 1)} <span className="text-paper/50">/ {pad(count)}</span>
        </p>
        <p className="mt-2 text-paper/70">
          <Decode key={project.id} text={project.title} />
        </p>
      </div>
      <div className="h-px w-48 bg-paper/20">
        <motion.div className="h-full origin-left bg-accent" style={{ scaleX: progress }} />
      </div>
    </div>
  );
}

// Act 3. The camera flies down a corridor of projects; each card comes out of the dark, sharpens in focus, then sweeps past.
export default function WorkCorridor() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const focusCard = (i: number) => {
    // Keyboard users tabbing through the cards: move the camera to the focused one.
    const el = sceneRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const p = (i + 0.5) / (count - 0.1);
    // Deferred a frame: the browser's own scroll-into-view for the focused element runs after the focus event.
    requestAnimationFrame(() => window.scrollTo({ top: top + p * travel, behavior: "instant" }));
  };

  return (
    <div ref={sceneRef}>
      <StoryScene vh={count * pin.corridorPerCard + pin.corridorTail}>
        {(progress) => <Corridor progress={progress} onFocusCard={focusCard} />}
      </StoryScene>
    </div>
  );
}

function Corridor({ progress, onFocusCard }: { progress: MotionValue<number>; onFocusCard: (i: number) => void }) {
  const focus = useTransform(progress, focusAt);
  return (
    <>
      <Floor progress={progress} />
      <div className="absolute inset-0 [perspective:1200px] [perspective-origin:50%_45%]">
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {projects.map((project, i) => (
            <Card key={project.id} project={project} index={i} focus={focus} onFocusCard={onFocusCard} />
          ))}
        </div>
      </div>
      <Hud progress={progress} focus={focus} />
    </>
  );
}
