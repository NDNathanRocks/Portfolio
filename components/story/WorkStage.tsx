"use client";

import WorkCorridor from "./WorkCorridor";
import useCinematic from "./useCinematic";
import { projects } from "@/lib/content";
import { pin } from "@/lib/story";

const trackVh = projects.length * pin.corridorPerCard + pin.corridorTail;

// Desktop with motion: the pinned corridor. Phones and reduced motion: the bento grid passed in as children.
// The wrapper already has the corridor's height in the server render (CSS only, same conditions as useCinematic),
// so anchors below it like /#experience land correctly before hydration swaps the grid out.
export default function WorkStage({ children }: { children: React.ReactNode }) {
  const cinematic = useCinematic();
  return (
    <div
      className="md:motion-safe:h-[var(--track-h)]"
      style={{ "--track-h": `${trackVh}vh` } as React.CSSProperties}
    >
      {cinematic ? <WorkCorridor vh={trackVh} /> : children}
    </div>
  );
}
