import type { PointerEvent } from "react";

// Writes cursor coordinates to CSS variables; no React state, so no re-render.
export function spotlightMove(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
  el.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
}
