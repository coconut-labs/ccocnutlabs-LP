import type { MetadataRoute } from "next";
import { STATIC_ROUTES, siteUrl } from "@/lib/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: new URL(route, siteUrl()).toString(),
    lastModified: new Date("2026-04-25"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
