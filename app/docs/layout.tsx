import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../../lib/source";
import { baseOptions } from "../../lib/layout.shared";
import { DocsI18nProvider } from "../components/docs-i18n-provider";
import { i18n } from "../../lib/i18n";
import { AISearch, AISearchPanel, AISearchTrigger } from "../../components/search";
import { MessageCircleIcon } from "lucide-react";
import { buttonVariants } from "../../components/ui/button";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree[i18n.defaultLanguage];

  return (
    <DocsI18nProvider locale={i18n.defaultLanguage}>
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
