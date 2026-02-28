import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { source } from "../../../lib/source";
import { getMDXComponents } from "../../../mdx-components";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function DocsSlugPage({ params }: Props) {
  const p = await params;
  const page = source.getPage(p.slug);
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
  return source.generateParams();
}
