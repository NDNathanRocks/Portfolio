import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";
import { getProjects } from "@/lib/db";

export default async function Page() {
  const projects = await getProjects();
  return (
    <>
      <Hero />
      <Timeline projects={projects} />
      <Contact />
    </>
  );
}
