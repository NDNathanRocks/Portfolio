"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "../Reveal";
import VelocityMarquee from "../VelocityMarquee";
import { projects, skills } from "@/lib/content";
import { captions } from "@/lib/story";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

const chips = skills.flatMap((s) => s.items.split(", "));
const rowA = chips.filter((_, i) => i % 2 === 0);
const rowB = chips.filter((_, i) => i % 2 === 1);
// Third row: project tech not already listed above. "ReactJS" vs "React" and similar count as the same thing.
const norm = (s: string) => s.toLowerCase().replace(/\.?js$/, "").replace(/[^a-z0-9+#]/g, "");
const known = new Set(chips.map(norm));
const rowC = [...new Set(projects.flatMap((p) => p.stack))].filter((s) => !known.has(norm(s)));

function Chip({ label }: { label: string }) {
  return (
    <span
      className={`mx-2 whitespace-nowrap rounded-full border border-paper/25 bg-ink/60 px-5 py-2.5 transition-colors hover:border-accent hover:bg-accent hover:text-ink ${mono}`}
    >
      {label}
    </span>
  );
}

// Act 5. The skill chips run across a plane tilted back into the distance; it straightens up a little as you pass over it.
export default function StackWall() {
  const ref = useRef<HTMLElement>(null);
  const k = useReducedMotion() ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [24 * k, 4 * k]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-4 * k, -1 * k]);
  const y = useTransform(scrollYProgress, [0, 1], [60 * k, -60 * k]);

  return (
    <section ref={ref} data-act="stack" aria-labelledby="stack-heading" className="relative overflow-hidden py-24 md:py-32">
      <h2 id="stack-heading" className="relative z-10 px-6 font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.95] tracking-[-0.03em] md:px-14">
        <Reveal>{captions.stack}</Reveal>
      </h2>
      <div aria-hidden className="mt-12 [perspective:900px] md:mt-16">
        <motion.div className="space-y-8 [transform-style:preserve-3d]" style={{ rotateX, rotateZ, y }}>
          <motion.div style={{ z: -160 * k }} className="opacity-40 blur-[1px]">
            <VelocityMarquee speed={0.7}>
              {rowC.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </VelocityMarquee>
          </motion.div>
          <VelocityMarquee speed={1.2} pauseOnHover>
            {rowA.map((c) => (
              <Chip key={c} label={c} />
            ))}
          </VelocityMarquee>
          <motion.div style={{ z: 60 * k }}>
            <VelocityMarquee speed={-1.2} pauseOnHover>
              {rowB.map((c) => (
                <Chip key={c} label={c} />
              ))}
            </VelocityMarquee>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
