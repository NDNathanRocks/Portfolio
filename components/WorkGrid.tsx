import BlurIn from "./BlurIn";
import ProjectTile from "./ProjectTile";
import Reveal from "./Reveal";
import VelocityMarquee from "./VelocityMarquee";
import { projects } from "@/lib/content";

const words = ["AI", "Full-Stack", "Computer Vision", "Data Pipelines", "ETL", "Neural Networks"];

export default function WorkGrid() {
  return (
    <section id="work" className="scroll-mt-4 py-24 md:py-32">
      <VelocityMarquee speed={1.4} className="mb-20 select-none md:mb-28" >
        {words.map((w) => (
          <span key={w} className="flex items-center">
            <span
              className="px-8 font-display text-[clamp(4rem,12vw,10rem)] font-light uppercase leading-none tracking-[-0.04em] text-transparent"
              style={{ WebkitTextStroke: "1px rgba(244,239,230,0.45)" }}
            >
              {w}
            </span>
            <span aria-hidden className="h-3 w-3 rounded-full bg-accent" />
          </span>
        ))}
      </VelocityMarquee>

      <div className="px-6 md:px-14">
        <div className="mb-12 flex items-baseline justify-between gap-6">
          <h2 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-light leading-[0.9] tracking-[-0.035em]">
            <Reveal>Work</Reveal>
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-paper/60">
            <BlurIn text={`${String(projects.length).padStart(2, "0")} selected`} />
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:auto-rows-[130px] md:grid-cols-12">
          {projects.map((project, i) => (
            <ProjectTile key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
