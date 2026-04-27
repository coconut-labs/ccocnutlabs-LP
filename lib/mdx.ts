export type MdxPluginConfig = {
  remarkPlugins: string[];
  rehypePlugins: string[];
  shikiThemes: {
    default: string;
    reading: string;
  };
};

export function getMdxPluginConfig(): MdxPluginConfig {
  return {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug", "rehype-autolink-headings", "@shikijs/rehype"],
    shikiThemes: {
      default: "github-light",
      reading: "min-light",
    },
  };
}

export function estimateMdxCompileSurface(source: string): { headings: number; codeBlocks: number } {
  return {
    headings: (source.match(/^#{2,3}\s/gm) ?? []).length,
    codeBlocks: (source.match(/^```/gm) ?? []).length / 2,
  };
}
