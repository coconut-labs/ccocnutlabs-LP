import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { loadPapers } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Papers · Coconut Labs",
  description: "Formal publications and preprints from Coconut Labs.",
  path: "/papers",
});

export default async function PapersPage() {
  const entries = await loadPapers();
  return <IndexPageTemplate entries={entries} subtitle="formal publications and preprints land here." title="Papers" />;
}
