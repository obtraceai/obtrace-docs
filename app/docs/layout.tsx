import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../../lib/source";
import { baseOptions } from "../../lib/layout.shared";
import { DocsI18nProvider } from "../components/docs-i18n-provider";
import { i18n } from "../../lib/i18n";
import { AISearch, AISearchPanel, AISearchTrigger } from "../../components/search";
import { MessageCircleIcon } from "lucide-react";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree[i18n.defaultLanguage];

  return (
    <DocsI18nProvider locale={i18n.defaultLanguage}>
      <AISearch locale="en">
        <DocsLayout tree={tree} {...baseOptions()}>
          {children}
        </DocsLayout>
        <AISearchTrigger
          className="gap-2 rounded-full border border-fd-border/70 bg-fd-foreground px-4 py-3 text-sm font-semibold text-fd-background shadow-2xl hover:opacity-95"
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
