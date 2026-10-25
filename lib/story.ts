// The home page is told as one camera move. Each act is tagged in the DOM with data-act; SideRail reads them back.
export const acts = [
  { id: "ignition", label: "Ignition" },
  { id: "dive", label: "The Dive" },
  { id: "corridor", label: "The Corridor" },
  { id: "path", label: "The Path" },
  { id: "stack", label: "The Stack" },
  { id: "landing", label: "Landing" },
] as const;

export type ActId = (typeof acts)[number]["id"];

export const captions = {
  dive: { kicker: "Act 02 — Entering", line: "From signal to systems." },
  stack: "What I build with",
} as const;

// Pinned scene lengths, in viewport heights (the sticky stage itself takes one of them).
export const pin = {
  heroDesktop: 230,
  heroMobile: 170,
  corridorPerCard: 75,
  corridorTail: 80,
} as const;

// Distance between corridor cards along the camera axis, in px.
export const corridorGap = 1100;
