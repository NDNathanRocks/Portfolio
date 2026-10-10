"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Project } from "@/lib/content";
import { demoRegistry } from "./registry";

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

function ConfidentialStage() {
  return (
    <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-sm border border-paper/15 bg-[#0d0d0d] p-8 md:min-h-[520px]">
      <div aria-hidden className="absolute inset-0 grid grid-cols-6 gap-3 p-6 opacity-60 blur-[6px]">
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              background: `linear-gradient(135deg, rgba(34,211,238,${0.08 + (i % 5) * 0.05}), rgba(99,102,241,${0.05 + (i % 4) * 0.05}))`,
              gridColumn: `span ${i % 4 === 0 ? 2 : 1}`,
              minHeight: 64 + (i % 3) * 36,
            }}
          />
        ))}
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent/20 to-transparent"
        initial={{ top: "-20%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative z-10 flex max-w-md flex-col items-center gap-5 rounded-sm border border-paper/15 bg-ink/85 p-8 text-center backdrop-blur-md">
        <svg aria-hidden viewBox="0 0 24 24" className="h-12 w-12 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4.5" y="10.5" width="15" height="10" rx="1.5" />
          <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
          <circle cx="12" cy="15.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
        <p className={`text-accent ${mono}`}>Confidential / Internal application</p>
        <p className="font-display text-2xl font-light leading-snug">
          Built inside Fraser Health Authority. No demo, screenshots or code are available.
        </p>
      </div>
    </div>
  );
}

function PlaceholderStage({ project }: { project: Project }) {
  const [launched, setLaunched] = useState(false);
  const Demo = demoRegistry[project.id];
  const note = project.demo.kind === "confidential" ? "" : project.demo.note;

  if (launched && Demo)
    return (
      <div>
        <Demo />
        <div className="mt-4 text-right">
          <button type="button" onClick={() => setLaunched(false)} className={`-my-2 inline-flex min-h-11 items-center px-2 text-paper/60 underline-offset-4 hover:text-paper hover:underline ${mono}`}>
            Close demo
          </button>
        </div>
      </div>
    );

  return (
    <div className="relative flex min-h-[420px] flex-col items-center justify-center gap-6 overflow-hidden rounded-sm border border-paper/15 bg-[#0d0d0d] p-8 text-center md:min-h-[520px]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(${project.from}22 1px, transparent 1px), linear-gradient(90deg, ${project.from}22 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black, transparent 70%)",
        }}
      />
      <p className={`relative text-accent ${mono}`}>Interactive demo</p>
      <p className="relative max-w-[36ch] font-display text-3xl font-light leading-tight md:text-4xl">
        {Demo ? "Ready when you are." : "Coming soon."}
      </p>
      <p className="relative max-w-[44ch] text-paper/60">{note}</p>
      <button
        type="button"
        disabled={!Demo}
        onClick={() => setLaunched(true)}
        className={`relative rounded-full border border-paper/30 px-8 py-3.5 transition-colors enabled:hover:border-accent enabled:hover:bg-accent enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${mono}`}
      >
        Launch demo
      </button>
    </div>
  );
}

export default function DemoStage({ project }: { project: Project }) {
  return project.demo.kind === "confidential" ? <ConfidentialStage /> : <PlaceholderStage project={project} />;
}
