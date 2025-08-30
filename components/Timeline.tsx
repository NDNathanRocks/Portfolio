"use client";
import type { Project } from "@/types";
import InView from "./InView";
import ProjectCard from "./ProjectCard";

export default function Timeline({ projects }: { projects: Project[] }) {
  return (
    <section id="projects" className="container py-16 md:py-24">
      <header className="mx-auto max-w-2xl text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Projects</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">A chronological journey through my Computing Science work.</p>
      </header>

      <div className="relative mx-auto max-w-5xl">
        {/* Center timeline */}
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full border-l border-dashed border-gray-300 dark:border-gray-700"></div>

        <ol className="space-y-16 md:space-y-24">
          {projects.map((p, i) => (
            <li key={p.id} className="relative">
              {/* Dot on the line */}
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-brand-600 ring-4 ring-white dark:ring-gray-900"></div>

              {/* Card positioned to the right of line */}
              <div className="md:pl-10 pt-4">
                <InView>
                  <div className="md:ml-6">
                    <ProjectCard project={p} />
                  </div>
                </InView>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
