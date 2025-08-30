import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Contact from "@/components/Contact";
import { getProjects } from "@/lib/db";

export const runtime = "nodejs";       // ensure Node runtime (needed for 'pg')
export const dynamic = "force-dynamic"; // disable static prerender for this page

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
