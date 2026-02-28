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
      <AISearch locale="en">
        <DocsLayout tree={tree} {...baseOptions()}>
          {children}
        </DocsLayout>
        <AISearchTrigger
          style={{ position: "fixed", right: 24, bottom: 24, zIndex: 2147483647 }}
          className={buttonVariants({
            color: "primary",
            size: "sm",
            className:
              "gap-2 rounded-full shadow-2xl z-[2147483647] border border-sky-300/40 bg-sky-500 text-white hover:bg-sky-400"
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
