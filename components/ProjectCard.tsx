// components/ProjectCard.tsx
"use client";
import Image from "next/image";
import type { Project } from "@/types";

function safeDateLabel(input: unknown): string {
  // Try to normalize yyyy-m-d → yyyy-mm-dd and accept Date objects too
  const asDate = (() => {
    if (input instanceof Date && !isNaN(input.getTime())) return input;

    if (typeof input === "string") {
      const s = input.trim();

      // Match 2025-8-3, 2025-08-03, or even 2025-08-03T00:00:00Z
      const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (iso) {
        const y = Number(iso[1]);
        const m = Number(iso[2]);
        const d = Number(iso[3]);
        // Build a stable UTC date to avoid TZ drift/hydration mismatches
        return new Date(Date.UTC(y, m - 1, d));
      }

      const t = Date.parse(s);
      if (!Number.isNaN(t)) return new Date(t);
    }

    return null;
  })();

  if (!asDate) return ""; // no date available; render nothing

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC", // keep SSR/CSR consistent
  }).format(asDate);
}

export default function ProjectCard({ project }: { project: Project }) {
  const dateLabel = safeDateLabel(project.date);

  return (
    <article className="w-full max-w-3xl rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden shadow-soft">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-2/5 h-56 md:h-auto">
          <Image
            src={project.image_url}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        </div>
        <div className="md:w-3/5 p-5 md:p-6">
          <h3 className="text-lg font-semibold leading-tight">{project.title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{project.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            {project.github_url && (
              <a className="underline underline-offset-4 hover:no-underline" href={project.github_url} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {project.demo_url && (
              <a className="underline underline-offset-4 hover:no-underline" href={project.demo_url} target="_blank" rel="noreferrer">Demo</a>
            )}
            {dateLabel && <span className="ml-auto text-xs opacity-70">{dateLabel}</span>}
          </div>
        </div>
      </div>
    </article>
  );
}