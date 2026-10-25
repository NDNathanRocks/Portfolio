"use client";

import { snap } from "@/lib/motion";
import Magnetic from "./Magnetic";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { acts } from "@/lib/story";

const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const labelClass = "font-mono text-xs uppercase tracking-[0.14em]";
const vertical = "[writing-mode:vertical-rl] rotate-180";

export default function SideRail() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [active, setActive] = useState<string | null>(null);
  const [act, setAct] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, snap);
  const dotY = useTransform(progress, [0, 1], [0, 87]);

  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(e.target.id));
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    ["top", ...sections.map((s) => s.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      setActive(null);
    };
  }, [home]);

  // Depth gauge: the current act is the last [data-act] element whose top has crossed the middle of the screen.
  useEffect(() => {
    if (!home) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-act]"));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string | null = null;
      for (const el of els) {
        if (!el.offsetParent && el.getClientRects().length === 0) continue;
        if (el.getBoundingClientRect().top <= window.innerHeight / 2) current = el.dataset.act ?? current;
      }
      const i = acts.findIndex((a) => a.id === current);
      setAct(i < 0 ? 0 : i);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      setAct(null);
    };
  }, [home]);

  const href = (id: string) => (home ? `#${id}` : `/#${id}`);
  const linkClass = (id?: string) =>
    `${labelClass} relative transition-colors duration-200 hover:text-accent ${id && active === id ? "text-accent" : "text-paper"}`;

  const Anchor = home ? "a" : Link;

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center justify-between border-r border-paper/15 bg-ink py-8 md:flex">
        <Magnetic max={4}>
          <Anchor href={home ? "#top" : "/"} className={`${linkClass("top")} ${vertical}`}>
            ND &mdash; Portfolio 26
          </Anchor>
        </Magnetic>
        <nav aria-label="Primary" className="flex flex-col items-center gap-9">
          {sections.map((s) => (
            <Magnetic key={s.id} max={4}>
              <Anchor
                href={href(s.id)}
                aria-current={active === s.id ? "location" : undefined}
                className={`${linkClass(s.id)} ${vertical}`}
              >
                {s.label}
                {active === s.id && (
                  <motion.span
                    aria-hidden
                    layoutId="rail-active"
                    transition={snap}
                    className="absolute inset-y-0 -left-3 w-[2px] bg-accent"
                  />
                )}
              </Anchor>
            </Magnetic>
          ))}
        </nav>
        <ThemeToggle />
        <div aria-hidden className={`relative h-28 w-4 overflow-hidden ${labelClass} text-[10px]`}>
          <AnimatePresence initial={false}>
            {act !== null && (
              <motion.span
                key={act}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={snap}
                className={`absolute inset-0 flex items-center justify-center whitespace-nowrap text-paper/60 ${vertical}`}
              >
                <span className="text-accent">{String(act + 1).padStart(2, "0")}</span>&nbsp;{acts[act].label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div aria-hidden className="relative flex h-24 w-px justify-center bg-paper/20">
          <motion.div className="absolute inset-x-0 top-0 h-full origin-top bg-accent" style={{ scaleY: progress }} />
          <motion.span
            className="absolute -left-[4px] top-0 h-[9px] w-[9px] rounded-full bg-accent"
            style={{ y: dotY }}
          />
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-paper/15 bg-ink/85 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <Anchor href={home ? "#top" : "/"} className={linkClass()}>ND</Anchor>
          <nav aria-label="Primary" className="flex items-center gap-5">
            {sections.map((s) => (
              <Anchor key={s.id} href={href(s.id)} className={linkClass(s.id)}>
                {s.label}
              </Anchor>
            ))}
            <ThemeToggle className="-my-3 -mr-3" />
          </nav>
        </div>
        <motion.div aria-hidden className="h-px origin-left bg-accent" style={{ scaleX: progress }} />
      </header>
    </>
  );
}
