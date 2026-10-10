"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { greetings } from "@/lib/greetings";

const ease = [0.2, 0.7, 0.2, 1] as const;

export default function HelloRotator() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);
  const [index, setIndex] = useState(0);
  const running = seen && inView && !reduced;

  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % greetings.length), 3000);
    return () => clearInterval(id);
  }, [running]);

  const g = greetings[index];

  return (
    <div ref={ref} className="font-display text-[clamp(2.75rem,10.5vw,11rem)] font-light tracking-[-0.045em]">
      <h2 className="sr-only">Say hello</h2>
      <div aria-hidden>
        <div className="flex items-baseline gap-[0.22em] whitespace-nowrap leading-[1.2]">
          <span className="shrink-0">Say</span>
          <div className="h-[1.3em] min-w-0 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={index}
                lang={g.locale}
                initial={{ y: "105%", opacity: 0, fontWeight: 200 }}
                animate={{ y: 0, opacity: 1, fontWeight: 300 }}
                exit={{ y: "-105%", opacity: 0, fontWeight: 700 }}
                transition={{ duration: 0.7, ease }}
                className="block whitespace-nowrap tracking-normal"
              >
                <span
                  dir={g.rtl ? "rtl" : "ltr"}
                  style={{ fontFamily: g.font, fontSize: `${g.scale ?? 1}em`, lineHeight: 0, unicodeBidi: "isolate", textAlign: "left" }}
                >
                  {g.text}
                </span>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4 font-mono text-xs uppercase tracking-[0.14em]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={g.lang}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="w-24"
            >
              {g.lang}
            </motion.span>
          </AnimatePresence>
          <div className="h-px w-28 bg-ink/20">
            {running && (
              <motion.div
                key={index}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-px origin-left bg-ink"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
