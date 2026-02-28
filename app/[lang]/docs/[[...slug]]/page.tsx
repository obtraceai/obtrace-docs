import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { source } from "../../../../lib/source";
import { getMDXComponents } from "../../../../mdx-components";
import { isSupportedLocale } from "../../../../lib/i18n";

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
      <DocsTitle>{mdxPage.data.title}</DocsTitle>
      {mdxPage.data.description ? <DocsDescription>{mdxPage.data.description}</DocsDescription> : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams("slug", "lang");
}
