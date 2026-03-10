import type { MetadataRoute } from "next";
import { source } from "../lib/source";
import { DOCS_SITE_URL, getDocsPath } from "../lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = source.generateParams("slug", "lang");

  return entries.map((entry) => ({
    url: `${DOCS_SITE_URL}${getDocsPath(entry.lang, entry.slug)}`,
    changeFrequency: "weekly",
    priority: entry.slug?.length ? 0.7 : 0.9
  }));
}
