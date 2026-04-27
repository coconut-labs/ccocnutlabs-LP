import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { loadPodcasts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Podcasts · Coconut Labs",
  description: "Episodes and appearances from Coconut Labs.",
  path: "/podcasts",
});

export default async function PodcastsPage() {
  const entries = await loadPodcasts();
  return <IndexPageTemplate entries={entries} subtitle="episodes, appearances, and talks when there is enough signal." title="Podcasts" />;
}
