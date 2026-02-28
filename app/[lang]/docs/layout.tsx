import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../../../lib/source";
import { baseOptions } from "../../../lib/layout.shared";
import { DocsI18nProvider } from "../../components/docs-i18n-provider";
import { isSupportedLocale } from "../../../lib/i18n";
import { AISearch, AISearchPanel, AISearchTrigger } from "../../../components/search";
import { MessageCircleIcon } from "lucide-react";
import { buttonVariants } from "../../../components/ui/button";

type Props = {
  children: ReactNode;
  params: Promise<{ lang: string }>;
};

export default async function LocalizedDocsLayout({ children, params }: Props) {
  const { lang } = await params;

  if (!isSupportedLocale(lang)) {
    notFound();
  }

  const tree = source.pageTree[lang];

  return (
    <DocsI18nProvider locale={lang}>
      <AISearch>
        <DocsLayout tree={tree} {...baseOptions()}>
          {children}
        </DocsLayout>
        <AISearchTrigger
          className={buttonVariants({
            color: "primary",
            size: "sm",
            className: "gap-2 rounded-full shadow-lg"
          })}
          position="float"
        >
          <MessageCircleIcon className="size-4" />
          Ask AI
        </AISearchTrigger>
        <AISearchPanel />
      </AISearch>
    </DocsI18nProvider>
  );
}
