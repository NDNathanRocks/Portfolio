"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center gap-2 rounded-xl border border-black/10 dark:border-white/10 px-3 py-1.5 shadow-soft hover:shadow transition"
    >
      <span className="text-xs">{isDark ? "Dark" : "Light"} mode</span>
      <span className="text-lg">{isDark ? "🌙" : "🌞"}</span>
    </button>
  );
}
