import { promises as fs } from "node:fs";
import path from "node:path";
import { cache } from "react";

type DocChunk = {
  path: string;
  url: string;
  title: string;
  locale: "en" | "pt-BR";
  sourceOfTruth: boolean;
  content: string;
};

const DOCS_ROOT = path.join(process.cwd(), "content", "docs");

function stripFrontmatter(raw: string) {
  return raw.replace(/^---[\s\S]*?---\s*/, "");
}

function getFrontmatterValue(raw: string, key: string) {
  const match = raw.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  return match?.[1]?.trim()?.replace(/^["']|["']$/g, "") ?? "";
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, " ")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim();
}

function scoreChunk(chunk: DocChunk, query: string, locale: string) {
  const terms = normalize(query).split(/\s+/).filter((term) => term.length > 1);
  const haystack = normalize(`${chunk.title} ${chunk.path} ${chunk.content}`);

  let score = 0;
  for (const term of terms) {
    if (haystack.includes(term)) score += 3;
    if (normalize(chunk.title).includes(term)) score += 6;
    if (normalize(chunk.path).includes(term)) score += 4;
  }

  if (chunk.sourceOfTruth) score += 10;
  if (chunk.locale === locale) score += 8;
  if (chunk.path.includes("quickstart")) score += 3;
  if (chunk.path.includes("workflows")) score += 4;
  if (chunk.path.includes("security")) score += 2;

  return score;
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(fullPath);
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) return [];
      return [fullPath];
    }),
  );

  return files.flat();
}

async function loadDocsIndexInternal(): Promise<DocChunk[]> {
  const files = await walk(DOCS_ROOT);
  return Promise.all(
    files.map(async (filePath) => {
      const raw = await fs.readFile(filePath, "utf8");
      const relativePath = path.relative(DOCS_ROOT, filePath).replace(/\\/g, "/");
      const locale = relativePath.endsWith(".pt-BR.mdx") ? "pt-BR" : "en";
      const publicPath = relativePath.replace(/\.pt-BR\.mdx$/, "").replace(/\.mdx$/, "");

      return {
        path: relativePath,
        url: locale === "pt-BR" ? `/pt-BR/docs/${publicPath}` : `/docs/${publicPath}`,
        title: getFrontmatterValue(raw, "title") || publicPath.split("/").pop() || publicPath,
        locale,
        sourceOfTruth: getFrontmatterValue(raw, "sourceOfTruth") === "true",
        content: stripFrontmatter(raw),
      } satisfies DocChunk;
    }),
  );
}

export const loadDocsIndex = cache(loadDocsIndexInternal);

export async function buildDocsContext(query: string, locale: string) {
  const docs = await loadDocsIndex();
  const llmTxt = await fs.readFile(path.join(process.cwd(), "llm.txt"), "utf8");

  const topDocs = docs
    .map((doc) => ({ doc, score: scoreChunk(doc, query, locale) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ doc }) => doc);

  const context = topDocs
    .map((doc, index) => {
      const excerpt = doc.content.slice(0, 2200).trim();
      return [
        `Source ${index + 1}: ${doc.title}`,
        `URL: https://docs.obtrace.ai${doc.url}`,
        `Locale: ${doc.locale}`,
        `Source of truth: ${doc.sourceOfTruth ? "yes" : "no"}`,
        `Content:\n${excerpt}`,
      ].join("\n");
    })
    .join("\n\n---\n\n");

  return { llmTxt, topDocs, context };
}
