"use client";

import { useEffect } from "react";
import WorkCorridor from "./WorkCorridor";
import useCinematic from "./useCinematic";

// Desktop with motion: the pinned corridor. Phones and reduced motion: the bento grid passed in as children.
export default function WorkStage({ children }: { children: React.ReactNode }) {
  const cinematic = useCinematic();

  // The corridor is far taller than the grid it replaces, so a deep link like /#experience resolved against the
  // server-rendered grid now points at the wrong place. Jump to it again once the corridor is in.
  useEffect(() => {
    if (!cinematic || !window.location.hash) return;
    const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    if (!target) return;
    const frame = requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant", block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [cinematic]);

  return cinematic ? <WorkCorridor /> : <>{children}</>;
}
