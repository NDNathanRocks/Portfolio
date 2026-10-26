import { getLenis } from "./scroll";

// Auto-play: drifts down the whole page so the story plays itself, coasting through the gaps and braking for each
// heading and card. Any wheel, touch, key or click hands control straight back to the visitor.
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
const FAST = 1.9;
const SLOW = 0.45;

// Scroll positions worth lingering on, marked in the markup:
//   data-tour-beat="0.3"        slow down when this element's top is 30% of the way down the screen
//   data-tour-beats="0.2,0.5"   on a pinned track: slow at these fractions of its pinned travel
// Measured once when the tour starts (it starts from the hero, before any sticky stage has pinned).
function findBeats(vh: number) {
  const top = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
  const shown = (el: Element) => el.getClientRects().length > 0;
  const beats: number[] = [];
  document.querySelectorAll<HTMLElement>("[data-tour-beat]").forEach((el) => {
    if (shown(el)) beats.push(top(el) - Number(el.dataset.tourBeat || 0.5) * vh);
  });
  document.querySelectorAll<HTMLElement>("[data-tour-beats]").forEach((el) => {
    if (!shown(el)) return;
    const travel = el.offsetHeight - vh;
    if (travel <= 0) return;
    el.dataset.tourBeats!.split(",").forEach((f) => beats.push(top(el) + Number(f) * travel));
  });
  return beats;
}

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
  const beats = findBeats(vh);
  let pos = window.scrollY;
  let speed = 0;
  let last = performance.now();

  const step = (now: number) => {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Coast faster through the gaps, then brake into each beat (a heading, a card in focus, the dive) and hold
    // slowly for a moment just past it.
    let near = 0;
    for (const b of beats) {
      const ahead = b - pos;
      const k = ahead >= 0 ? ahead / (vh * 0.45) : -ahead / (vh * 0.2);
      if (k < 1) near = Math.max(near, 1 - smooth(k));
    }
    const pace = FAST - (FAST - SLOW) * near;
    speed += (cruise * pace - speed) * Math.min(1, dt * 2);
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
