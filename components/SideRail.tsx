"use client";

import { snap } from "@/lib/motion";
import Magnetic from "./Magnetic";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { acts } from "@/lib/story";

const sections = [
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

// Each act's link target (the ids already on the page, plus #dive and #stack).
const anchors: Record<(typeof acts)[number]["id"], string> = {
  ignition: "top",
  dive: "dive",
  corridor: "work",
  path: "experience",
  stack: "stack",
  landing: "contact",
};

const labelClass = "font-mono text-xs uppercase tracking-[0.14em]";
const vertical = "[writing-mode:vertical-rl] rotate-180";

export default function SideRail() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [active, setActive] = useState<string | null>(null);
  const [act, setAct] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const gaugeRef = useRef<HTMLDivElement>(null);
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

  // The act list closes on Escape or a click anywhere outside it.
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const onDown = (e: PointerEvent) => {
      if (!gaugeRef.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

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
        <div ref={gaugeRef} className="relative">
          {home && (
            <button
              type="button"
              onClick={() => setMenu((o) => !o)}
              aria-expanded={menu}
              aria-controls="act-list"
              aria-label="Jump to an act"
              className="group relative block h-28 w-8 cursor-pointer"
            >
          <span aria-hidden className={`relative block h-28 w-8 overflow-hidden ${labelClass} text-[10px] transition-colors group-hover:text-accent`}>
          <AnimatePresence initial={false}>
            {act !== null && (
              <motion.span
                key={act}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={snap}
                className={`absolute inset-0 flex items-center justify-center whitespace-nowrap text-mute ${vertical}`}
              >
                <span className="text-accent">{String(act + 1).padStart(2, "0")}</span>&nbsp;{acts[act].label}
              </motion.span>
            )}
          </AnimatePresence>
          </span>
            </button>
          )}
          <AnimatePresence>
            {menu && (
              <motion.nav
                id="act-list"
                aria-label="Acts"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={snap}
                className="absolute bottom-0 left-[calc(100%+1.25rem)] z-50 w-60 border border-paper/15 bg-ink p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)]"
              >
                <ol>
                  {acts.map((a, i) => (
                    <li key={a.id}>
                      <a
                        href={`#${anchors[a.id]}`}
                        onClick={() => setMenu(false)}
                        aria-current={act === i ? "location" : undefined}
                        className={`${labelClass} flex items-center gap-3 px-3 py-3 transition-colors hover:bg-paper/10 hover:text-accent ${act === i ? "text-accent" : "text-soft"}`}
                      >
                        <span className="text-mute">{String(i + 1).padStart(2, "0")}</span>
                        {a.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </motion.nav>
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
