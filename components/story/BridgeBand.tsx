"use client";

import VelocityMarquee from "../VelocityMarquee";

const words = ["AI", "Full-Stack", "Computer Vision", "Data Pipelines", "ETL", "Neural Networks"];

// What the work is about, as a slim instrument strip that connects the dive to the corridor.
export default function BridgeBand({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-y border-paper/15 py-3.5 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] ${className}`}
    >
      <VelocityMarquee speed={1.4}>
        {words.map((w) => (
          <span key={w} className="flex items-center font-mono text-xs uppercase tracking-[0.14em] text-mute">
            <span className="px-6">{w}</span>
            <span aria-hidden className="text-accent">+</span>
          </span>
        ))}
      </VelocityMarquee>
    </div>
  );
}
