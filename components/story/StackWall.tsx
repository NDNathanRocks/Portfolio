"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Reveal from "../Reveal";
import VelocityMarquee from "../VelocityMarquee";
import ActKicker from "./ActKicker";
import Scrim from "./Scrim";
import WarpFlash from "./WarpFlash";
import { projects, skills } from "@/lib/content";
import { captions, taglines } from "@/lib/story";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

// "ReactJS" and "React", "Next.js" and "Next" count as the same chip, and nothing appears twice.
const norm = (s: string) => s.toLowerCase().replace(/\.?js$/, "").replace(/[^a-z0-9+#]/g, "");
const seen = new Set<string>();
const take = (items: string[]) =>
  items.filter((c) => {
    const key = norm(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
const split = (i: number) => skills[i].items.split(", ");
const rowA = take([...split(0), ...split(1)]);
const rowB = take([...split(2), ...projects.flatMap((p) => p.stack)]);

function Chip({ label }: { label: string }) {
  return (
    <span
      className={`mx-2 whitespace-nowrap rounded-full border border-paper/30 bg-ink/80 px-5 py-2.5 text-soft transition-colors hover:border-accent hover:bg-accent hover:text-ink ${mono}`}
    >
      {label}
    </span>
  );
}

// The two rows share one flat tilted plane (no preserve-3d, so nothing flattens and nothing is cut off); the far row is a
// touch smaller and slower. The tilt eases to near-flat as the section reaches the middle of the screen, so chips are crisp
// where you are looking.
export default function StackWall() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const k = reduced ? 0 : 1;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotateX = useTransform(scrollYProgress, [0, 0.45, 1], [26 * k, 3 * k, 3 * k]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.45, 1], [-4 * k, -1 * k, -1 * k]);
  const y = useTransform(scrollYProgress, [0, 1], [30 * k, -30 * k]);
  const edge = "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]";

  return (
    <section ref={ref} data-act="stack" aria-labelledby="stack-heading" className="relative py-24 md:py-32">
      <WarpFlash />
      <div className="relative px-6 md:px-14">
        <Scrim className="-inset-x-10 -inset-y-12" />
        <ActKicker index={4} line={taglines.stack} />
        <h2 id="stack-heading" className="mt-6 font-display text-[clamp(2.5rem,6vw,5rem)] font-light leading-[0.95] tracking-[-0.03em]">
          <Reveal>{captions.stack}</Reveal>
        </h2>
      </div>

      <ul className="mt-12 hidden flex-wrap gap-3 px-6 motion-reduce:flex md:px-14">
        {[...rowA, ...rowB].map((c) => (
          <li key={c} className={`rounded-full border border-paper/30 px-4 py-2 text-soft ${mono}`}>
            {c}
          </li>
        ))}
      </ul>
        <div aria-hidden className="mt-12 [perspective:1000px] motion-reduce:hidden md:mt-16">
          <motion.div className="-mx-[6%] space-y-6" style={{ rotateX, rotateZ, y }}>
            <div className={`origin-center scale-[0.94] ${edge}`}>
              <VelocityMarquee speed={0.9} pauseOnHover>
                {rowA.map((c) => (
                  <Chip key={c} label={c} />
                ))}
              </VelocityMarquee>
            </div>
            <div className={`origin-center scale-[1.03] ${edge}`}>
              <VelocityMarquee speed={-1.5} pauseOnHover>
                {rowB.map((c) => (
                  <Chip key={c} label={c} />
                ))}
              </VelocityMarquee>
            </div>
          </motion.div>
        </div>
    </section>
  );
}
