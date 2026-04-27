import { ProjectHero } from "@/components/projects/ProjectHero";
import { Markdown } from "@/lib/markdown";
import { loadProject } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "KVWarden · Coconut Labs",
  description: "Tenant fairness on shared inference.",
  path: "/projects/kvwarden",
});

export default async function KVWardenPage() {
  const project = await loadProject("kvwarden");
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
