import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { source } from "../../lib/source";
import { baseOptions } from "../../lib/layout.shared";
import { DocsI18nProvider } from "../components/docs-i18n-provider";
import { i18n } from "../../lib/i18n";
import { DocsAiLauncher } from "../components/docs-ai-launcher";
import { ChatwootWidget } from "../components/chatwoot-widget";

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree[i18n.defaultLanguage];

  return (
    <DocsI18nProvider locale={i18n.defaultLanguage}>
      <DocsLayout tree={tree} {...baseOptions()}>
        {children}
      </DocsLayout>
      <DocsAiLauncher locale="en" label="Ask AI" />
      <ChatwootWidget locale="en" />
    </DocsI18nProvider>
  );
}
