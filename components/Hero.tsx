"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import VariableText from "./VariableText";
import OrbitObject from "./OrbitObject";
import { profile } from "@/lib/content";
import { resumePath } from "@/lib/site";

const label = "font-mono text-xs uppercase tracking-[0.14em] text-paper/60";

function Drift({
  progress,
  distance,
  className = "",
  children,
}: {
  progress: MotionValue<number>;
  distance: number;
  className?: string;
  children: React.ReactNode;
}) {
  const y = useTransform(progress, [0, 1], [0, distance]);
  return (
    <motion.span className={`block ${className}`} style={{ y }}>
      {children}
    </motion.span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const k = reduced ? 0 : 1;
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const footerOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 pb-10 pt-10 md:px-14 md:pt-14"
    >
      <div className={`relative z-10 flex justify-between ${label}`}>
        <span>Portfolio &mdash; 2026</span>
        <span>Vancouver, BC</span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-[4%] opacity-35 sm:opacity-60 lg:pr-[7%] lg:opacity-100">
        <div className="pointer-events-auto origin-right scale-[0.62] sm:scale-75 lg:scale-100">
          <OrbitObject scroll={scrollYProgress} />
        </div>
      </div>

      <div className="relative z-10 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
          className="font-hero uppercase leading-[0.86] tracking-[-0.04em] text-[clamp(3.75rem,11.5vw,10.75rem)]"
        >
          <span className="sr-only">{profile.fullName}</span>
          {profile.nameLines.map((line, i) => (
            <Drift
              key={line}
              progress={scrollYProgress}
              distance={-(60 + i * 70) * k}
              className={i === profile.nameLines.length - 1 ? "text-accent" : ""}
            >
              <VariableText text={line} rest={{ wght: 200, wdth: 100 }} peak={{ wght: 900, wdth: 125 }} />
            </Drift>
          ))}
        </motion.h1>

        <motion.div style={{ opacity: subtitleOpacity }}>
          <Drift progress={scrollYProgress} distance={-260 * k}>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-10 max-w-3xl font-hero text-xl text-paper/85 md:text-3xl"
            >
              <VariableText
                text={profile.subtitle}
                rest={{ wght: 350, wdth: 100 }}
                peak={{ wght: 800, wdth: 125 }}
                falloff={[1, 0.6, 0.3, 0.1]}
              />
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <a
                href={resumePath}
                download="Nathan_DSouza_Resume.pdf"
                className={`mt-8 inline-flex items-center gap-3 rounded-full border border-paper/30 px-6 py-3.5 text-paper transition-colors hover:border-accent hover:bg-accent hover:text-ink focus-visible:border-accent focus-visible:bg-accent focus-visible:text-ink font-mono text-xs uppercase tracking-[0.14em]`}
              >
                Download Resume <span aria-hidden>↓</span>
              </a>
            </motion.div>
          </Drift>
        </motion.div>
      </div>

      <motion.div style={{ opacity: footerOpacity }} className={`relative z-10 flex flex-wrap justify-between gap-4 ${label}`}>
        <span>{profile.education}</span>
        <span>Scroll &darr;</span>
      </motion.div>
    </section>
  );
}
