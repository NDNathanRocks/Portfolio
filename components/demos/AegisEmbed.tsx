"use client";

import { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 900;
const MAX_HEIGHT = 20000;

// Embeds the live Aegis race arena. The app reports its content height with
// postMessage({ type: "aegis:resize", height }) so the frame never needs an inner scrollbar.
export default function AegisEmbed({ src, origin, note }: { src: string; origin: string; note: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(MIN_HEIGHT);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data as { type?: unknown; height?: unknown } | null;
      if (data?.type !== "aegis:resize" || typeof data.height !== "number" || !Number.isFinite(data.height)) return;
      setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, Math.ceil(data.height))));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  return (
    <div>
      <iframe
        ref={frame}
        src={src}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        title="Naive vs Engineered AI Architecture Race"
        loading="lazy"
        allow="clipboard-write"
        className="surface block w-full rounded-sm border-0 bg-s2"
        style={{ width: "100%", border: 0, minHeight: MIN_HEIGHT, height: `${height}px` }}
      />
      <p className="mt-4 max-w-[70ch] text-sm text-paper/60">{note}</p>
    </div>
  );
}
