import { ProjectHero } from "@/components/projects/ProjectHero";
import { loadProject } from "@/lib/content";
import { Markdown } from "@/lib/markdown";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "mlxd · Coconut Labs",
  description: "Tenant-fair LLM inference on Apple Silicon.",
  path: "/projects/mlxd",
});

export default async function MlxdPage() {
  const project = await loadProject("mlxd");
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
