import type { Metadata } from "next";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { source } from "../../../../lib/source";
import { getMDXComponents } from "../../../../mdx-components";
import { isSupportedLocale } from "../../../../lib/i18n";
import { buildDocsMetadata, buildDocsSchema } from "../../../../lib/metadata";

type Props = {
  params: Promise<{ lang: string; slug?: string[] }>;
};

export default async function LocalizedDocsSlugPage({ params }: Props) {
  const p = await params;

  if (!isSupportedLocale(p.lang)) {
    notFound();
  }

  const page = source.getPage(p.slug, p.lang);

  if (!page) {
    notFound();
  }

  const mdxPage = page as any;
  const MDX = mdxPage.data.body;

  return (
    <DocsPage toc={mdxPage.data.toc}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildDocsSchema({
        lang: p.lang,
        slug: p.slug,
        title: mdxPage.data.title,
        description: mdxPage.data.description ?? (p.lang === "pt-BR" ? "Página da documentação da Obtrace" : "Obtrace documentation page")
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

  if (!isSupportedLocale(p.lang)) {
    return {};
  }

  const page = source.getPage(p.slug, p.lang);

  if (!page) {
    return {};
  }

  const mdxPage = page as any;

  return buildDocsMetadata({
    lang: p.lang,
    slug: p.slug,
    title: mdxPage.data.title,
    description: mdxPage.data.description ?? (p.lang === "pt-BR" ? "Página da documentação da Obtrace" : "Obtrace documentation page")
  });
}

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}
