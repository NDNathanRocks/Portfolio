import dynamic from "next/dynamic";
import type { ComponentType } from "react";

// Map a project id to its client-side demo component. Each is its own chunk that is only
// downloaded when the visitor clicks "Launch demo", so the project pages stay light.
const lazy = (load: () => Promise<{ default: ComponentType }>) => dynamic(load, { ssr: false, loading: () => null });

export const demoRegistry: Record<string, ComponentType | undefined> = {
  smile: lazy(() => import("./SmileDemo")),
  panoramic: lazy(() => import("./StitchDemo")),
  binit: lazy(() => import("./BinItDemo")),
  clarity: lazy(() => import("./ClarityDemo")),
};
