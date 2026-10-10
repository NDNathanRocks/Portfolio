"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, type Variants } from "framer-motion";
import CountUp from "./CountUp";
import Reveal from "./Reveal";
import VelocityMarquee from "./VelocityMarquee";
import { awards, experience, skills } from "@/lib/content";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";
const ease = [0.2, 0.7, 0.2, 1] as const;

const chips = skills.flatMap((s) => s.items.split(", "));
const rowA = chips.filter((_, i) => i % 2 === 0);
const rowB = chips.filter((_, i) => i % 2 === 1);

function Chip({ label }: { label: string }) {
  return (
    <span
      className={`mx-2 whitespace-nowrap rounded-full border border-paper/25 px-5 py-2.5 transition-colors hover:border-accent hover:bg-accent hover:text-ink ${mono}`}
    >
      {label}
    </span>
  );
}

export default function Experience() {
  const listRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 25 });

  const wash = (origin: string): Variants => ({
    rest: { clipPath: `circle(0% at ${origin})` },
    hover: { clipPath: `circle(150% at ${origin})` },
  });
  const ink: Variants = { rest: { color: "#f4efe6" }, hover: { color: "#0a0a0a" } };

  return (
    <section id="experience" className="scroll-mt-4 py-24 md:py-32">
      <div className="px-6 md:px-14">
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 lg:grid-cols-12">
          <div className="self-start lg:sticky lg:top-24 lg:col-span-4">
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-light leading-[0.95] tracking-[-0.03em]">
              <Reveal>Where I&rsquo;ve</Reveal>
              <Reveal delay={0.08}>been</Reveal>
            </h2>
            <p className={`mt-6 text-paper/50 ${mono}`}>03 chapters</p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <div className="relative pl-8 md:pl-10">
              <div aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-paper/15">
                <motion.div className="h-full origin-top bg-accent" style={{ scaleY: line }} />
              </div>
              <ul ref={listRef}>
                {experience.map((row, i) => {
                  const origin = i % 2 === 0 ? "100% 0%" : "0% 100%";
                  return (
                    <motion.li
                      key={row.role}
                      initial="rest"
                      whileHover="hover"
                      className="relative border-t border-paper/15 last:border-b"
                    >
                      <motion.span
                        aria-hidden
                        initial={{ backgroundColor: "#0a0a0a", scale: 1 }}
                        whileInView={{ backgroundColor: "#d6ff3f", scale: 1.5 }}
                        viewport={{ margin: "-45% 0px -45% 0px" }}
                        transition={{ duration: 0.4 }}
                        className="absolute left-[-36px] top-[38px] z-20 hidden h-[9px] w-[9px] rounded-full border border-accent md:block md:left-[-44px]"
                      />
                      <div className="relative overflow-hidden">
                      <motion.div
                        aria-hidden
                        variants={wash(origin)}
                        transition={{ duration: 0.8, ease }}
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(135deg, ${row.from}, ${row.to})` }}
                      />
                      <motion.div variants={ink} transition={{ duration: 0.4 }} className="relative z-10 px-5 py-7">
                        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:gap-6">
                          <div>
                            <p className="font-display text-2xl font-light leading-tight md:text-3xl">{row.role}</p>
                            <p className={`mt-2 opacity-60 ${mono}`}>{row.org}</p>
                          </div>
                          <span className={`whitespace-nowrap opacity-60 ${mono}`}>{row.dates}</span>
                        </div>
                        {row.metrics.length > 0 && (
                          <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-5">
                            {row.metrics.map((m) => (
                              <div key={m.label}>
                                <dt className="sr-only">{m.label}</dt>
                                <dd className="font-display text-4xl font-medium leading-none tracking-[-0.03em] md:text-5xl">
                                  <CountUp value={m.value} prefix={m.prefix} suffix={m.suffix} />
                                  <span aria-hidden className={`mt-2 block font-mono text-xs font-normal uppercase tracking-[0.14em] opacity-60`}>
                                    {m.label}
                                  </span>
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </motion.div>
                      </div>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h3 className={`mb-4 text-accent ${mono}`}>Awards</h3>
                <ul className="space-y-5">
                  {awards.map((a) => (
                    <li key={a.title}>
                      <p className="font-display text-xl">{a.title}</p>
                      <p className="text-paper/70">{a.detail}</p>
                      <p className={`mt-1 text-paper/50 ${mono}`}>{a.date}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`mb-4 text-accent ${mono}`}>Stack</h3>
                <ul className="space-y-5">
                  {skills.map((s) => (
                    <li key={s.group}>
                      <p className="font-display text-xl">{s.group}</p>
                      <p className="text-paper/70">{s.items}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden className="mt-24 space-y-4">
        <VelocityMarquee speed={1.2} pauseOnHover>
          {rowA.map((c) => (
            <Chip key={c} label={c} />
          ))}
        </VelocityMarquee>
        <VelocityMarquee speed={-1.2} pauseOnHover>
          {rowB.map((c) => (
            <Chip key={c} label={c} />
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
