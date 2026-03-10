import type { Metadata } from "next";
import { i18n } from "./i18n";

export const DOCS_SITE_URL = "https://docs.obtrace.ai";
export const DOCS_OG_IMAGE = `${DOCS_SITE_URL}/logo-full.svg`;

export function getDocsPath(lang: string, slug?: string[]): string {
  const pathSuffix = slug && slug.length > 0 ? `/${slug.join("/")}` : "";
  return lang === i18n.defaultLanguage ? `/docs${pathSuffix}` : `/${lang}/docs${pathSuffix}`;
}

export function buildDocsMetadata(input: {
  lang: string;
  slug?: string[];
  title: string;
  description: string;
}): Metadata {
  const canonicalPath = getDocsPath(input.lang, input.slug);
  const canonical = `${DOCS_SITE_URL}${canonicalPath}`;
  const enPath = `${DOCS_SITE_URL}${getDocsPath("en", input.slug)}`;
  const ptBrPath = `${DOCS_SITE_URL}${getDocsPath("pt-BR", input.slug)}`;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical,
      languages: {
        en: enPath,
        "pt-BR": ptBrPath
      }
    },
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      type: "article",
      siteName: "Obtrace Docs",
      images: [DOCS_OG_IMAGE]
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [DOCS_OG_IMAGE]
    }
  };
}

export function buildDocsSchema(input: {
  lang: string;
  slug?: string[];
  title: string;
  description: string;
}) {
  const path = getDocsPath(input.lang, input.slug);
  const url = `${DOCS_SITE_URL}${path}`;
  const breadcrumbNames = ["Docs", ...(input.slug ?? []).map((segment) => segment.replace(/-/g, " "))];
  const breadcrumbPaths = breadcrumbNames.map((_, index) => {
    if (index === 0) {
      return `${DOCS_SITE_URL}${getDocsPath(input.lang)}`;
    }

    return `${DOCS_SITE_URL}${getDocsPath(input.lang, input.slug?.slice(0, index))}`;
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: input.title,
        description: input.description,
        inLanguage: input.lang,
        url,
        about: ["AIOps", "Auto-remediation", "Observability", "Root cause analysis"],
        isPartOf: `${DOCS_SITE_URL}/docs`
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbNames.map((name, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          item: breadcrumbPaths[index]
        }))
      }
    ]
  };
}
