"use client";

import DepthPlace from "./story/DepthPlace";
import ActKicker from "./story/ActKicker";
import Road from "./story/Road";
import Scrim from "./story/Scrim";
import WarpFlash from "./story/WarpFlash";
import { taglines } from "@/lib/story";
import { easeDrawer } from "@/lib/motion";
import { spotlightMove } from "@/lib/spotlight";
import BlurIn from "./BlurIn";
import { useRef } from "react";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import CountUp from "./CountUp";
import Reveal from "./Reveal";
import { awards, experience, skills } from "@/lib/content";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";
const ease = easeDrawer;

// Awards and stack rows flip up off the page, one after another.
const flip: Variants = {
  hidden: { opacity: 0, rotateX: -40, y: 18 },
  shown: (i: number) => ({ opacity: 1, rotateX: 0, y: 0, transition: { duration: 0.6, delay: i * 0.07, ease: easeDrawer } }),
};
const flipProps = (i: number) => ({
  custom: i,
  variants: flip,
  initial: "hidden",
  whileInView: "shown",
  viewport: { once: true, margin: "-60px" },
  style: { transformOrigin: "50% 100%" },
});

export default function Experience() {
  const listRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  const wash = (origin: string): Variants => ({
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  });

  return (
    <section id="experience" data-act="path" className="relative scroll-mt-4 py-24 md:py-32">
      <WarpFlash />
      <Scrim className="inset-x-0 -inset-y-10" />
      <div className="px-6 md:px-14">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-12">
          <div className="self-start lg:sticky lg:top-24 lg:col-span-4">
            <ActKicker index={3} line={taglines.path} className="mb-8" />
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light leading-[0.95] tracking-[-0.03em]">
              <Reveal>Where I&rsquo;ve</Reveal>
              <Reveal delay={0.08}>been</Reveal>
            </h2>
            <p className={`mt-6 text-mute ${mono}`}><BlurIn text="03 chapters" /></p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative pl-8 md:pl-10">
              <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-paper/15 md:hidden">
                <motion.div className="h-full origin-top bg-accent" style={{ scaleY: line }} />
              </div>
              <Road progress={line} scroll={scrollYProgress} />
              <ul ref={listRef}>
                {experience.map((row, i) => {
                  const origin = i % 2 === 0 ? "100% 0%" : "0% 100%";
                  return (
                    <motion.li
                      key={row.role}
                      initial="rest"
                      whileHover="hover"
                      className="group relative border-t border-paper/15 last:border-b"
                    >
                      <motion.span
                        aria-hidden
                        initial={{ scale: 1, opacity: 0 }}
                        whileInView={{ scale: 3.2, opacity: [0.8, 0] }}
                        viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                        transition={{ duration: 0.9, ease: easeDrawer }}
                        className="pointer-events-none absolute left-[-36px] top-[38px] z-10 hidden h-[9px] w-[9px] rounded-full border border-accent md:left-[-44px] md:block"
                      />
                      <motion.span
                        aria-hidden
                        initial={{ scale: 1 }}
                        whileInView={{ scale: 1.5 }}
                        viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                        transition={{ duration: 0.3, ease: easeDrawer }}
                        className="absolute left-[-36px] top-[38px] z-20 hidden h-[9px] w-[9px] overflow-hidden rounded-full border border-accent bg-ink md:block md:left-[-44px]"
                      >
                        <motion.span
                          className="absolute inset-0 bg-accent"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true, margin: "-45% 0px -45% 0px" }}
                          transition={{ duration: 0.3, ease: easeDrawer }}
                        />
                      </motion.span>
                      <DepthPlace x={i % 2 === 0 ? 36 : -36}>
                      <div className="spotlight relative overflow-hidden" onPointerMove={spotlightMove}>
                      <motion.div
                        aria-hidden
                        variants={wash(origin)}
                        transition={{ duration: 0.5, ease }}
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${row.from}, ${row.to})` }}
                      />
                      <div className="relative z-10 px-5 py-7 transition-colors duration-300 group-hover:text-[#0a0a0a] group-focus-within:text-[#0a0a0a]">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-6">
                          <div>
                            <p className="font-display text-2xl font-light leading-tight md:text-3xl">{row.role}</p>
                            <p className={`mt-2 opacity-80 ${mono}`}>{row.org}</p>
                          </div>
                          <span className={`whitespace-nowrap opacity-80 ${mono}`}>{row.dates}</span>
                        </div>
                        {row.metrics.length > 0 && (
                          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
                            {row.metrics.map((m) => (
                              <div key={m.label}>
                                <dt className="sr-only">{m.label}</dt>
                                <dd className="font-display text-4xl font-medium leading-none tracking-[-0.03em] md:text-5xl">
                                  <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                                  <span aria-hidden className={`mt-2 block font-mono text-xs font-normal uppercase tracking-[0.14em] opacity-80`}>
                                    <BlurIn text={m.label} />
                                  </span>
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                      </div>
                      </DepthPlace>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h3 className={`mb-4 text-accent ${mono}`}>Awards</h3>
                <ul className="space-y-5 [perspective:800px]">
                  {awards.map((a, i) => (
                    <motion.li key={a.title} {...flipProps(i)}>
                      <p className="font-display text-xl">{a.title}</p>
                      <p className="text-soft">{a.detail}</p>
                      <p className={`mt-1 text-mute ${mono}`}>{a.date}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`mb-4 text-accent ${mono}`}>Stack</h3>
                <ul className="space-y-5 [perspective:800px]">
                  {skills.map((s, i) => (
                    <motion.li key={s.group} {...flipProps(i)}>
                      <p className="font-display text-xl">{s.group}</p>
                      <p className="text-soft">{s.items}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
