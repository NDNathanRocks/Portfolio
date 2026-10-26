"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

// framer-motion's useReducedMotion reads the media query during the very first client render, so anything styled from
// it differs from the server HTML (which always assumes full motion) and React reports a hydration mismatch.
// This reports false while hydrating, exactly like the server, then switches to the real setting straight after.
export default function useReduced() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
