import ScrollSkew from "./ScrollSkew";
import BlurIn from "./BlurIn";
import ProjectTile from "./ProjectTile";
import Reveal from "./Reveal";
import ActKicker from "./story/ActKicker";
import BridgeBand from "./story/BridgeBand";
import WorkStage from "./story/WorkStage";
import { projects } from "@/lib/content";
import { taglines } from "@/lib/story";

// On desktop with motion the heading, count and bridge band live inside the pinned corridor (WorkCorridor).
// Everything passed to WorkStage here is the fallback for phones and reduced motion.
export default function WorkGrid() {
  return (
    <section id="work" data-act="corridor" className="scroll-mt-4">
      <WorkStage>
        <div className="py-24 md:py-32">
          <BridgeBand className="mb-16 md:mb-20" />
          <div className="px-6 md:px-14">
            <ActKicker index={2} line={taglines.corridor} className="mb-6" />
            <div className="mb-12 flex items-baseline justify-between gap-6">
              <h2 className="font-display text-[clamp(3.5rem,9vw,7.5rem)] font-light leading-[0.9] tracking-[-0.035em]">
                <Reveal>Work</Reveal>
              </h2>
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-mute">
                <BlurIn text={`${String(projects.length).padStart(2, "0")} selected`} />
              </span>
            </div>
            <ScrollSkew className="grid grid-cols-1 gap-5 md:auto-rows-[130px] md:grid-cols-12">
              {projects.map((project, i) => (
                <ProjectTile key={project.id} project={project} index={i} />
              ))}
            </ScrollSkew>
          </div>
        </div>
      </WorkStage>
    </section>
  );
}
