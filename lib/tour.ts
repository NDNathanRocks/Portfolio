import { getLenis } from "./scroll";

// Auto-play: drifts down the whole page so the story plays itself, easing off at the start of each act so every
// scene gets a beat. Any wheel, touch, key or click hands control straight back to the visitor.
let running = false;
let frame = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const isTouring = () => running;
export function subscribeTour(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

const TAKEOVER = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
const smooth = (t: number) => t * t * (3 - 2 * t);

// The tour's own buttons toggle it themselves; treating their press as a takeover would stop then restart it.
function takeover(e: Event) {
  if ((e.target as Element | null)?.closest?.("[data-tour-control]")) return;
  stopTour();
}

export function stopTour() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(frame);
  TAKEOVER.forEach((t) => window.removeEventListener(t, takeover, true));
  emit();
}

export function startTour() {
  if (running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  running = true;
  emit();
  // Added a frame late so the click or keypress that started the tour doesn't immediately stop it.
  requestAnimationFrame(() => {
    if (running) TAKEOVER.forEach((t) => window.addEventListener(t, takeover, { capture: true, passive: true }));
  });

  const vh = window.innerHeight;
  const cruise = Math.max(140, vh * 0.2); // px per second: about 50 s top to bottom on a desktop
  const acts = [...document.querySelectorAll<HTMLElement>("[data-act]")]
    .filter((el) => el.offsetParent || el.getClientRects().length)
    .map((el) => el.getBoundingClientRect().top + window.scrollY);
  let pos = window.scrollY;
  let speed = 0;
  let last = performance.now();

  const step = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Half speed just after each act begins, blending back to cruise over half a screen.
    let pace = 1;
    for (const top of acts) {
      const into = pos - top;
      if (into >= -vh * 0.1 && into < vh * 0.5) pace = Math.min(pace, 0.5 + 0.5 * smooth(Math.max(0, into) / (vh * 0.5)));
    }
    speed += (cruise * pace - speed) * Math.min(1, dt * 1.5);
    const max = document.documentElement.scrollHeight - vh;
    pos = Math.min(max, pos + speed * dt);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(pos, { immediate: true, force: true });
    else window.scrollTo(0, pos);
    if (pos >= max - 0.5) {
      stopTour();
      return;
    }
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}
