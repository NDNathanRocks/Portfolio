"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isTouring, startTour, stopTour, subscribeTour } from "@/lib/tour";
import { easeOut } from "@/lib/motion";

const useTouring = () => useSyncExternalStore(subscribeTour, isTouring, () => false);
const mono = "font-mono text-xs uppercase tracking-[0.14em]";

// The "Auto-play" control in the hero. Hidden for reduced motion, since auto-scrolling is motion.
export function TourButton({ className = "" }: { className?: string }) {
  const touring = useTouring();
  return (
    <button
      type="button"
      data-tour-control
      onClick={() => (touring ? stopTour() : startTour())}
      aria-pressed={touring}
      className={`group inline-flex min-h-11 items-center gap-2 transition-colors hover:text-accent focus-visible:text-accent motion-reduce:hidden ${className}`}
    >
      <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
        {touring ? "❚❚" : "▶"}
      </span>
      {touring ? "Pause" : "Auto-play"}
    </button>
  );
}

// While the tour runs: a small pill saying how to take over, plus a stop button. Also starts the tour from a
// shared link (/?tour), so the site can be shown off hands-free.
export default function TourStatus() {
  const touring = useTouring();

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("tour")) return;
    const t = window.setTimeout(startTour, 1400);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => stopTour, []);

  return (
    <AnimatePresence>
      {touring && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: easeOut }}
          className={`fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 whitespace-nowrap rounded-full border border-paper/15 bg-ink/80 py-1.5 pl-5 pr-1.5 text-paper shadow-[0_20px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-md md:left-[calc(50%+38px)] ${mono}`}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent motion-safe:animate-pulse" />
          <span>
            Auto-playing<span className="hidden sm:inline"> &middot; scroll to take over</span>
          </span>
          <button
            type="button"
            data-tour-control
            onClick={stopTour}
            className="min-h-9 rounded-full bg-paper/10 px-4 transition-colors hover:bg-accent hover:text-ink focus-visible:bg-accent focus-visible:text-ink"
          >
            Stop
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
