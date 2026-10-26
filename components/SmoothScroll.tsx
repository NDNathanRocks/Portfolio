"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { getLenis, readSpot, restoreSpot, saveSpot, setLenis, takeReturn } from "@/lib/scroll";

export default function SmoothScroll() {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const popped = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, anchors: true });
    setLenis(lenis);
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Remember the spot on the home page whenever a link leads off it, and note back/forward so it can be restored.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (window.location.pathname !== "/" || e.defaultPrevented || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === "/") return;
      const slug = url.pathname.match(/^\/projects\/([^/]+)/)?.[1];
      saveSpot({ y: window.scrollY, slug });
    };
    const onPop = () => {
      popped.current = true;
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  useEffect(() => {
    const back = popped.current;
    popped.current = false;
    if (firstRender.current) {
      firstRender.current = false;
      // A full reload of a project page followed by Back lands here as a fresh load, not a popstate.
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const spot = pathname === "/" && nav?.type === "back_forward" ? readSpot() : null;
      if (spot) restoreSpot(spot);
      return;
    }
    const spot = pathname === "/" && (takeReturn() || back) ? readSpot() : null;
    if (spot) {
      restoreSpot(spot);
      return;
    }
    if (window.location.hash) return;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
