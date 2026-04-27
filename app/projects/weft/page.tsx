import { ProjectHero } from "@/components/projects/ProjectHero";
import { loadProject } from "@/lib/content";
import { Markdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Weft · Coconut Labs",
  description: "Scheduling experiments for Apple Silicon inference.",
  path: "/projects/weft",
});

export default async function WeftPage() {
  const project = await loadProject("weft");
  return (
    <>
      <ProjectHero project={project} />
      <section className="content-band pt-0">
        <div className="content-inner post-body">
          <Markdown content={project.content} />
        </div>
      </section>
    </>
  );
}
