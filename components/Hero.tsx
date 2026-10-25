"use client";

import Magnetic from "./Magnetic";
import { easeOut } from "@/lib/motion";
import { useRef } from "react";
import { motion, transform, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import VariableText from "./VariableText";
import OrbitObject from "./OrbitObject";
import HeroDive from "./story/HeroDive";
import useCinematic from "./story/useCinematic";
import { profile } from "@/lib/content";
import { resumePath } from "@/lib/site";
import { pin } from "@/lib/story";

const label = "font-mono text-xs uppercase tracking-[0.14em] text-mute";

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

// Acts 1–2. On desktop the hero is pinned for a while: the name lifts away, the cube slides to centre, swells and bursts
// as the camera flies through it. On phones and with reduced motion it is the plain one-screen hero.
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const cinematic = useCinematic();
  const live = useRef(cinematic);
  live.current = cinematic;
  const { scrollYProgress: drift } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const { scrollYProgress: dive } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // The intro drift plays over the first 45% of the pin on desktop, and over the hero's own scroll-out elsewhere.
  const early = useTransform([drift, dive], ([d, p]) => (live.current ? Math.min(1, (p as number) / 0.45) : (d as number)));
  const still = useReducedMotion() ? 0 : 1;
  // Desktop-only mappings read the live flag on every frame. A fixed output range would be baked in at mount
  // (framer hands scroll-linked opacity to the compositor), before we know which mode we're in.
  const gated = <T,>(input: number[], output: T[]) => {
    const map = transform(input, output);
    return (v: number) => (live.current ? map(v) : output[0]);
  };

  const subtitleOpacity = useTransform(early, [0, 0.55], [1, 0]);
  const footerOpacity = useTransform(early, [0, 0.3], [1, 0]);
  const nameOpacity = useTransform(dive, gated([0.12, 0.4], [1, 0]));
  const nameScale = useTransform(dive, gated([0.1, 0.45], [1, 0.88]));

  const cubeX = useTransform(dive, gated([0.12, 0.6], ["0vw", "-30vw"]));
  const cubeScale = useTransform(dive, gated([0.2, 0.88], [1, 7]));
  const cubeOpacity = useTransform(dive, gated([0.72, 0.9], [1, 0]));
  const cubeBoost = useTransform(dive, gated([0.35, 0.88], [0, 2.4]));
  const cubePointer = useTransform(dive, (v) => (live.current && v > 0.2 ? "none" : "auto"));

  return (
    <section
      id="top"
      ref={ref}
      data-act="ignition"
      className="relative md:motion-safe:h-[var(--hero-h)]"
      style={{ "--hero-h": `${pin.heroDesktop}vh` } as React.CSSProperties}
    >
      <div aria-hidden id="dive" data-act="dive" className="pointer-events-none absolute inset-x-0 bottom-0 top-[35%] hidden md:motion-safe:block" />
      <div className="relative flex min-h-screen flex-col justify-between overflow-hidden px-6 pb-10 pt-10 md:px-14 md:pt-14 md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-screen">
        <motion.div style={{ opacity: footerOpacity }} className={`relative z-10 flex justify-between ${label}`}>
          <span>Portfolio &mdash; 2026</span>
          <span>Vancouver, BC</span>
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center pr-[4%] opacity-35 sm:opacity-60 lg:pr-[7%] lg:opacity-100">
          <motion.div style={{ x: cubeX, scale: cubeScale, opacity: cubeOpacity, pointerEvents: cubePointer }}>
            <div className="origin-right scale-[0.62] sm:scale-75 lg:scale-100">
              <OrbitObject scroll={early} boost={cubeBoost} />
            </div>
          </motion.div>
        </div>

        <motion.div className="relative z-10 origin-left py-12" style={{ opacity: nameOpacity, scale: nameScale }}>
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="font-hero uppercase leading-[0.86] tracking-[-0.04em] text-[clamp(3.75rem,11.5vw,10.75rem)]"
          >
            <span className="sr-only">{profile.fullName}</span>
            {profile.nameLines.map((line, i) => (
              <Drift
                key={line}
                progress={early}
                distance={-(60 + i * 70) * still}
                className={i === profile.nameLines.length - 1 ? "text-accent" : ""}
              >
                <VariableText text={line} rest={{ wght: 200, wdth: 100 }} peak={{ wght: 900, wdth: 125 }} />
              </Drift>
            ))}
          </motion.h1>

          <motion.div style={{ opacity: subtitleOpacity }}>
            <Drift progress={early} distance={-260 * still}>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: easeOut }}
                className="mt-10 max-w-3xl font-hero text-xl text-soft md:text-3xl"
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
                transition={{ duration: 0.55, delay: 0.22, ease: easeOut }}
              >
                <Magnetic className="mt-8">
                  <a
                    href={resumePath}
                    download="Nathan_DSouza_Resume.pdf"
                    className={`inline-flex items-center gap-3 rounded-full border border-paper/30 px-6 py-3.5 text-paper transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-ink focus-visible:border-accent focus-visible:bg-accent focus-visible:text-ink font-mono text-xs uppercase tracking-[0.14em]`}
                  >
                    Download Resume <span aria-hidden>↓</span>
                  </a>
                </Magnetic>
              </motion.div>
            </Drift>
          </motion.div>
        </motion.div>

        <motion.div style={{ opacity: footerOpacity }} className={`relative z-10 flex flex-wrap justify-between gap-4 ${label}`}>
          <span>{profile.education}</span>
          <span className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
            Scroll to enter &darr;
          </span>
        </motion.div>

        {cinematic && <HeroDive progress={dive} />}
      </div>
    </section>
  );
}
