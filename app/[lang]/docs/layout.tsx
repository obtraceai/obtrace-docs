import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../../../lib/source";
import { baseOptions } from "../../../lib/layout.shared";
import { DocsI18nProvider } from "../../components/docs-i18n-provider";
import { isSupportedLocale } from "../../../lib/i18n";
import { AISearch, AISearchPanel, AISearchTrigger } from "../../../components/search";
import { MessageCircleIcon } from "lucide-react";

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
      <AISearch locale={lang}>
        <DocsLayout tree={tree} {...baseOptions()}>
          {children}
        </DocsLayout>
        <AISearchTrigger
          className="gap-2 rounded-full border border-fd-border/70 bg-fd-foreground px-4 py-3 text-sm font-semibold text-fd-background shadow-2xl hover:opacity-95"
          position="float"
        >
          <MessageCircleIcon className="size-4" />
          {lang === "pt-BR" ? "Pergunte à IA" : "Ask AI"}
        </AISearchTrigger>
        <AISearchPanel />
      </AISearch>
    </DocsI18nProvider>
  );
}
