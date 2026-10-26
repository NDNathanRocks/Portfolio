import type Lenis from "lenis";

// The one Lenis instance (null on reduced motion or before mount), shared without putting it on window.
let lenis: Lenis | null = null;
export const getLenis = () => lenis;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

// Where the visitor was on the home page when they opened a project, so coming back lands them in the same spot.
type Spot = { y: number; slug?: string };
const SPOT = "descent:spot";
const RETURN = "descent:return";

export function saveSpot(spot: Spot) {
  try {
    sessionStorage.setItem(SPOT, JSON.stringify(spot));
  } catch {}
}

export function readSpot(): Spot | null {
  try {
    const raw = sessionStorage.getItem(SPOT);
    const spot = raw ? (JSON.parse(raw) as Spot) : null;
    return spot && Number.isFinite(spot.y) ? spot : null;
  } catch {
    return null;
  }
}

// Set by "All work" just before it navigates home, read once on arrival.
export function markReturn() {
  try {
    sessionStorage.setItem(RETURN, "1");
  } catch {}
}

export function takeReturn() {
  try {
    const wanted = sessionStorage.getItem(RETURN) === "1";
    sessionStorage.removeItem(RETURN);
    return wanted;
  } catch {
    return false;
  }
}

// Jump to y once the page is tall enough to hold it, then mark the card the visitor came from.
export function restoreSpot(spot: Spot) {
  let tries = 0;
  const go = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max < spot.y && tries++ < 40) {
      requestAnimationFrame(go);
      return;
    }
    if (lenis) {
      lenis.resize();
      lenis.scrollTo(spot.y, { immediate: true, force: true });
    } else window.scrollTo(0, spot.y);
    if (spot.slug) flagCard(spot.slug);
  };
  requestAnimationFrame(go);
}

// The corridor remounts its cards just after hydration, so keep tagging fresh copies for as long as the ring shows.
function flagCard(slug: string) {
  const selector = `a[href="/projects/${slug}"]`;
  const tag = () =>
    document.querySelectorAll(`${selector}:not([data-returned])`).forEach((c) => c.setAttribute("data-returned", ""));
  tag();
  const watch = new MutationObserver(tag);
  watch.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => {
    watch.disconnect();
    document.querySelectorAll(selector).forEach((c) => c.removeAttribute("data-returned"));
  }, 2600);
}

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

// The climb back to the hero. Fixed length so the replay feels the same from anywhere on the page.
export function ascend(onArrive: () => void) {
  if (!lenis) return false;
  const root = document.documentElement;
  root.dataset.ascending = "";
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    delete root.dataset.ascending;
    onArrive();
  };
  lenis.scrollTo(0, { duration: 2.8, easing: easeInOutCubic, force: true, onComplete: finish });
  // A wheel or touch mid-climb cancels Lenis without onComplete, so clear the glow regardless.
  window.setTimeout(() => {
    if (!done) {
      done = true;
      delete root.dataset.ascending;
    }
  }, 3200);
  return true;
}
