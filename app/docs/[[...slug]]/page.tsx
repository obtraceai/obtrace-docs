import type { Metadata } from "next";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { source } from "../../../lib/source";
import { getMDXComponents } from "../../../mdx-components";
import { i18n } from "../../../lib/i18n";
import { buildDocsMetadata, buildDocsSchema } from "../../../lib/metadata";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function DocsSlugPage({ params }: Props) {
  const p = await params;
  const page = source.getPage(p.slug, i18n.defaultLanguage);
  if (!page) {
    notFound();
  }
  const mdxPage = page as any;

  const MDX = mdxPage.data.body;

  return (
    <DocsPage toc={mdxPage.data.toc}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDocsSchema({
        lang: i18n.defaultLanguage,
        slug: p.slug,
        title: mdxPage.data.title,
        description: mdxPage.data.description ?? "Obtrace documentation page"
      })) }} />
      <DocsTitle>{mdxPage.data.title}</DocsTitle>
      {mdxPage.data.description ? <DocsDescription>{mdxPage.data.description}</DocsDescription> : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const page = source.getPage(p.slug, i18n.defaultLanguage);

  if (!page) {
    return {};
  }

  const mdxPage = page as any;

  return buildDocsMetadata({
    lang: i18n.defaultLanguage,
    slug: p.slug,
    title: mdxPage.data.title,
    description: mdxPage.data.description ?? "Obtrace documentation page"
  });
}

export function generateStaticParams() {
  return source.generateParams("slug", "lang").filter((item) => item.lang === i18n.defaultLanguage).map((item) => ({
    slug: item.slug
  }));
}
