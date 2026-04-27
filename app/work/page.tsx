import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { loadWork } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Work · Coconut Labs",
  description: "Open-source tools and experiments from Coconut Labs.",
  path: "/work",
});

export default async function WorkPage() {
  const entries = await loadWork();
  return <IndexPageTemplate entries={entries} subtitle="open-source tools, traces, and experiments." title="Work" />;
}
