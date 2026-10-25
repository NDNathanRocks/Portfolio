"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; z: number; hot: boolean };

// Small seeded PRNG so the field is laid out the same way on every visit.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgb(hex: string, fallback: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return fallback;
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// The fixed backdrop for the whole home page: a starfield the camera flies through as you scroll (faster scroll, longer streaks),
// plus a perspective floor under the hero that fades out once you leave it.
export default function DepthField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = !window.matchMedia("(min-width: 768px)").matches;
    const rand = mulberry32(26);
    const stars: Star[] = Array.from({ length: small ? 110 : 260 }, () => ({
      x: rand() * 2 - 1,
      y: rand() * 2 - 1,
      z: rand(),
      hot: rand() < 0.08,
    }));

    const color = { paper: "244, 239, 230", accent: "214, 255, 63" };
    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      color.paper = rgb(s.getPropertyValue("--paper").trim(), color.paper);
      color.accent = rgb(s.getPropertyValue("--accent").trim(), color.accent);
    };
    readColors();
    const themeWatch = new MutationObserver(readColors);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      pointer.tx = e.clientX / w - 0.5;
      pointer.ty = e.clientY / h - 0.5;
    };
    if (!small && !reduced) window.addEventListener("pointermove", onMove, { passive: true });

    const work = document.getElementById("work");
    const contact = document.getElementById("contact");
    let lastY = window.scrollY;
    let speed = 0;
    let phase = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const k = Math.min((now - last) / 16.7, 3);
      last = now;
      const y = window.scrollY;
      speed += (y - lastY - speed) * 0.12;
      lastY = y;
      pointer.x += (pointer.tx - pointer.x) * 0.05;
      pointer.y += (pointer.ty - pointer.y) * 0.05;

      // Scrolling down flies forward, scrolling up backs out; a slow idle drift keeps it alive when still.
      const dz = reduced ? 0 : -(0.0007 + Math.max(-0.03, Math.min(0.03, speed * 0.0003))) * k;
      const f = Math.min(w, h) * 0.55;
      const cx = w / 2;
      const cy = h / 2;
      // Nothing shows through the opaque contact block, so skip the work while it fills the screen.
      const cover = contact?.getBoundingClientRect();
      if (cover && cover.top <= 0 && cover.bottom >= h) {
        if (!reduced) raf = requestAnimationFrame(frame);
        return;
      }
      ctx.clearRect(0, 0, w, h);
      // Past the corridor the field sits behind body text, so it fades back to a quiet 30%.
      const workEnd = work ? work.getBoundingClientRect().bottom : Infinity;
      const quiet = workEnd < h ? Math.max(0.3, workEnd / h) : 1;

      // Hero floor: a grid receding to a horizon, fading out over the first screen of scroll.
      const floor = Math.max(0, 1 - y / (h * 0.9)) * (small ? 0.16 : 0.22);
      if (floor > 0.01) {
        phase = (phase + (reduced ? 0 : 0.004 * k + Math.max(0, speed) * 0.002)) % 1;
        const horizon = cy + h * 0.14;
        const grad = ctx.createLinearGradient(0, horizon, 0, h);
        grad.addColorStop(0, `rgba(${color.paper}, 0)`);
        grad.addColorStop(1, `rgba(${color.paper}, ${floor})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 1; i < 16; i++) {
          const sy = horizon + (h * 0.45) / (i - phase + 0.4);
          if (sy > h) continue;
          ctx.moveTo(0, sy);
          ctx.lineTo(w, sy);
        }
        for (let i = -14; i <= 14; i++) {
          ctx.moveTo(cx - pointer.x * 60, horizon);
          ctx.lineTo(cx + i * w * 0.16, h);
        }
        ctx.stroke();
      }

      for (const s of stars) {
        s.z += dz;
        if (s.z <= 0.02) {
          s.z += 1;
          s.x = rand() * 2 - 1;
          s.y = rand() * 2 - 1;
        } else if (s.z > 1) {
          s.z -= 1;
        }
        const px = cx + ((s.x - pointer.x * 0.12) / s.z) * f;
        const py = cy + ((s.y - pointer.y * 0.12) / s.z) * f;
        if (px < -20 || px > w + 20 || py < -20 || py > h + 20) continue;
        const near = 1 - s.z;
        const alpha = Math.min(1, near * 1.1) * Math.min(1, (1 - s.z) * 6) * (s.hot ? 0.9 : 0.55) * quiet;
        const size = near * 2 + 0.4;
        const c = s.hot ? color.accent : color.paper;
        const trail = Math.abs(dz) > 0.004 ? dz * 3 : 0;
        if (trail) {
          const tz = Math.max(0.02, s.z - trail);
          ctx.strokeStyle = `rgba(${c}, ${alpha})`;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(cx + ((s.x - pointer.x * 0.12) / tz) * f, cy + ((s.y - pointer.y * 0.12) / tz) * f);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(${c}, ${alpha})`;
          ctx.fillRect(px - size / 2, py - size / 2, size, size);
        }
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
