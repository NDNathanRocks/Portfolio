import type { ComponentType } from "react";

// Map a project id to its client-side demo component (loaded lazily via next/dynamic).
export const demoRegistry: Record<string, ComponentType | undefined> = {};
