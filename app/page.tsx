import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import DepthField from "@/components/story/DepthField";
import Fog from "@/components/story/Fog";
import Sky from "@/components/story/Sky";
import StackWall from "@/components/story/StackWall";

export default function Home() {
  return (
    <>
      <Sky />
      <DepthField />
      <Fog />
      <div className="relative z-[1]">
        <Hero />
        <WorkGrid />
        <Experience />
        <StackWall />
        <Contact />
      </div>
    </>
  );
}
