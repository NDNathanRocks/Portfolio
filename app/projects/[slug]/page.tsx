import Enter from "@/components/Enter";
import Magnetic from "@/components/Magnetic";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DemoStage from "@/components/demos/DemoStage";
import ImpactPanel from "@/components/demos/ImpactPanel";
import { getProject, projects } from "@/lib/content";

type Params = { slug: string };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} | Nathan Nicholas D'Souza`,
    description: `${project.title}: ${project.subtitle}`,
  };
}

const mono = "font-mono text-xs uppercase tracking-[0.14em]";

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.id === slug);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  return (
    <article className="px-6 pb-24 pt-12 md:px-14 md:pt-14">
      <Link href="/#work" className={`-my-3 inline-flex min-h-11 items-center text-paper/60 transition-colors hover:text-accent ${mono}`}>
        &larr; All work
      </Link>

      <header className="mb-16 mt-12 md:mb-20">
        <div
          aria-hidden
          className="mb-8 h-[3px] w-24 rounded-full"
          style={{ background: `linear-gradient(90deg, ${project.from}, ${project.to})` }}
        />
        <Enter>
          <p className={`text-paper/60 ${mono}`}>{project.meta}</p>
        </Enter>
        <Enter step={1}>
          <h1 className="mt-5 font-display text-[clamp(3rem,10vw,9rem)] font-light leading-[0.9] tracking-[-0.04em]">
            {project.title}
          </h1>
        </Enter>
        <Enter step={2}>
          <p className="mt-6 max-w-[36ch] text-xl text-paper/80 md:text-2xl">{project.subtitle}</p>
          <ul className={`mt-6 flex flex-wrap gap-x-5 gap-y-2 text-paper/60 ${mono}`}>
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Enter>
        {project.repo && (
          <Enter step={3}>
            <Magnetic className="mt-8">
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block rounded-full border border-paper/30 px-7 py-3 transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-ink ${mono}`}
              >
                View on GitHub ↗
              </a>
            </Magnetic>
          </Enter>
        )}
      </header>

      {project.impact && (
        <div className="mb-20">
          <ImpactPanel impact={project.impact} />
        </div>
      )}

      <section aria-label="Demo">
        <DemoStage project={project} />
      </section>

      <nav aria-label="More projects" className="mt-20 grid grid-cols-2 gap-6 border-t border-paper/15 pt-8">
        <Link href={`/projects/${prev.id}`} className="group">
          <span className={`block text-paper/60 ${mono}`}>&larr; Previous</span>
          <span className="mt-2 block font-display text-2xl font-light transition-colors group-hover:text-accent md:text-4xl">
            {prev.title}
          </span>
        </Link>
        <Link href={`/projects/${next.id}`} className="group text-right">
          <span className={`block text-paper/60 ${mono}`}>Next &rarr;</span>
          <span className="mt-2 block font-display text-2xl font-light transition-colors group-hover:text-accent md:text-4xl">
            {next.title}
          </span>
        </Link>
      </nav>
    </article>
  );
}
