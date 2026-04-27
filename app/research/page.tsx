import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { getAllPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Research · Coconut Labs",
  description: "Research notes, papers, and systems writing from Coconut Labs.",
  path: "/research",
});

export default async function ResearchPage() {
  const posts = await getAllPosts();

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">research feed</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Research</h1>
        <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          writing, measurements, papers, and artifacts from the lab notebook.
        </p>
        <div className="mt-14 grid gap-5">
          {posts.map((post) => (
            <Link className="focus-ring rounded-lg" href={`/research/${post.slug}`} key={post.slug}>
              <Card className="grid gap-6 md:grid-cols-[11rem_minmax(0,1fr)_auto]">
                <p className="font-mono text-xs uppercase text-ink-2">
                  {post.date}
                  <br />
                  {post.type}
                </p>
                <div>
                  <h2 className="font-serif text-4xl leading-tight">{post.title}</h2>
                  <p className="mt-3 max-w-3xl text-ink-1">{post.dek}</p>
                  <p className="mt-4 font-mono text-xs text-ink-2">{post.authors.join(", ")}</p>
                </div>
                <ArrowRight aria-hidden="true" className="text-accent" size={18} />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
