"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import useReduced from "@/lib/useReduced";

type Theme = "dark" | "light";

// Light/dark switch. New visitors start in dark (see the inline script in layout); a manual choice is saved per browser,
// and reveals the new theme as a circle expanding from the button where View Transitions are supported.
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const reduced = useReduced();

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "light" ? "light" : "dark");
  }, []);

  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "light" ? "dark" : "light";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch {}
      setTheme(next);
    };
    if (reduced || !document.startViewTransition) return apply();

    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document
      .startViewTransition(() => flushSync(apply))
      .ready.then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
  };

  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full text-paper transition-colors duration-200 hover:text-accent ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="12" cy="12" r={light ? 4 : 5} className="transition-[r] duration-300" fill={light ? "none" : "currentColor"} />
        <g className={`origin-center transition-[opacity,transform] duration-300 ${light ? "opacity-100" : "opacity-0 scale-75"}`} style={{ transformOrigin: "12px 12px" }}>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </g>
      </svg>
    </button>
  );
}
