import { ContactStrip } from "@/components/home/ContactStrip";
import { Hero } from "@/components/home/Hero";
import { LiveSignalsStrip } from "@/components/home/LiveSignalsStrip";
import { ManifestoStrip } from "@/components/home/ManifestoStrip";
import { PeopleStrip } from "@/components/home/PeopleStrip";
import { ProjectsStrip } from "@/components/home/ProjectsStrip";
import { ResearchStrip } from "@/components/home/ResearchStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ManifestoStrip />
      <ProjectsStrip />
      <ResearchStrip />
      <PeopleStrip />
      <ContactStrip />
      <LiveSignalsStrip />
    </>
  );
}
