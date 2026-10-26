"use client";

import { useEffect, useState } from "react";
import useReduced from "@/lib/useReduced";

// True only on a desktop-width screen with motion allowed. Starts false so the server and first client render agree.
export default function useCinematic() {
  const reduced = useReduced();
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return wide && !reduced;
}
