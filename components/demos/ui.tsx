"use client";

import type { ReactNode } from "react";

export const mono = "font-mono text-xs uppercase tracking-[0.14em]";

export const btn =
  "rounded-full border border-paper/30 px-6 py-3 transition-colors enabled:hover:border-accent enabled:hover:bg-accent enabled:hover:text-ink focus-visible:border-accent focus-within:border-accent focus-within:bg-accent/15 disabled:cursor-not-allowed disabled:opacity-40 " +
  mono;

export const btnPrimary =
  "rounded-full border border-accent bg-accent px-6 py-3 text-ink transition-opacity enabled:hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 " +
  mono;

// Frame shared by every demo: label row, privacy line, body.
export function DemoFrame({ label, privacy, children }: { label: string; privacy: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-paper/15 bg-[#0d0d0d]">
      <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-paper/10 px-5 py-3 ${mono}`}>
        <span className="text-accent">{label}</span>
        <span className="text-paper/50">{privacy}</span>
      </div>
      <div className="p-5 md:p-8">{children}</div>
    </div>
  );
}

export function Progress({ label, value }: { label: string; value?: number }) {
  return (
    <div role="status" aria-live="polite" className="w-full max-w-md">
      <div className={`mb-2 flex justify-between text-paper/70 ${mono}`}>
        <span>{label}</span>
        {value !== undefined && <span>{Math.round(value * 100)}%</span>}
      </div>
      <div className="h-[3px] w-full overflow-hidden bg-paper/15">
        <div
          className={`h-full bg-accent ${value === undefined ? "w-1/3 animate-pulse" : ""}`}
          style={value === undefined ? undefined : { width: `${Math.max(2, value * 100)}%` }}
        />
      </div>
    </div>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-sm border border-[#f43f5e]/50 bg-[#f43f5e]/10 px-4 py-3 text-sm text-paper/90">
      {children}
    </p>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={`text-paper/50 ${mono}`}>{label}</dt>
      <dd className="mt-1 font-display text-2xl font-light tabular-nums">{value}</dd>
    </div>
  );
}

// Streams a download and reports 0..1 progress (falls back to indeterminate when length is unknown).
export async function fetchWithProgress(url: string, onProgress: (p: number | undefined) => void): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`Download failed (${res.status})`);
  const total = Number(res.headers.get("content-length")) || 0;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress(total ? Math.min(1, got / total) : undefined);
  }
  const out = new Uint8Array(got);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out.buffer;
}
