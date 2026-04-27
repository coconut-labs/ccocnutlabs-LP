import { describe, expect, it } from "vitest";
import {
  getAllPosts,
  getPostBySlug,
  loadPapers,
  loadPeople,
  loadPodcasts,
  loadProject,
  loadWork,
  parseFrontmatter,
} from "@/lib/content";

describe("content loaders", () => {
  it("parses required post frontmatter", () => {
    const post = parseFrontmatter(
      `---
title: "A title"
dek: "A dek"
date: "2026-04-25"
type: "note"
authors:
  - "Shrey Patel"
---

## Body

Text.`,
      "fallback",
    );

    expect(post.slug).toBe("fallback");
    expect(post.readingTime).toBe("1 min read");
  });

  it("loads published posts newest first", async () => {
    const posts = await getAllPosts();
    expect(posts[0]?.slug).toBe("tenant-fairness-on-shared-inference");
    expect(posts.every((post) => post.status === "published")).toBe(true);
  });

  it("loads a post by slug", async () => {
    const post = await getPostBySlug("tenant-fairness-on-shared-inference");
    expect(post?.title).toMatch(/Tenant fairness/);
  });

  it("loads work and empty manifests", async () => {
    await expect(loadWork()).resolves.toHaveLength(3);
    await expect(loadPapers()).resolves.toEqual([]);
    await expect(loadPodcasts()).resolves.toEqual([]);
  });

  it("loads project frontmatter", async () => {
    const project = await loadProject("kvwarden");
    expect(project.status).toBe("live");
    expect(project.outbound).toBe("https://kvwarden.org");
  });

  it("loads both founders", async () => {
    const people = await loadPeople();
    expect(people.map((person) => person.name)).toEqual(["Shrey Patel", "Jay Patel"]);
    expect(people[0]?.image).toBe("/images/shrey-patel-placeholder.svg");
    expect(people[1]?.image).toBe("/images/jay-patel-placeholder.svg");
    expect(people[0]?.links.some((link) => link.href === "mailto:shreypatel@coconutlabs.org")).toBe(true);
    expect(people[1]?.links.some((link) => link.href === "mailto:jaypatel@coconutlabs.org")).toBe(true);
  });
});
