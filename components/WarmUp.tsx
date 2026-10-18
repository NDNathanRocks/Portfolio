"use client";

import { useEffect } from "react";

// Free Render containers sleep after ~15 min idle. Ping the Aegis API as soon as anyone lands so it is awake by
// the time they open the race arena. Fire-and-forget: the response is opaque and failures are ignored.
export default function WarmUp() {
  useEffect(() => {
    fetch("https://aegis-ai-race-api.onrender.com/api/health", { mode: "no-cors" }).catch(() => {});
  }, []);
  return null;
}
