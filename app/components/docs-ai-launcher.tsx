"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircleIcon } from "lucide-react";
import { AISearch, AISearchPanel, AISearchTrigger } from "../../components/search";

type DocsAiLauncherProps = {
  locale: string;
  label: string;
};

export function DocsAiLauncher({ locale, label }: DocsAiLauncherProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AISearch locale={locale}>
      <AISearchTrigger
        className="gap-2 rounded-full border border-fd-border/70 bg-fd-foreground px-4 py-3 text-sm font-semibold text-fd-background shadow-2xl hover:opacity-95"
        position="float"
      >
        <MessageCircleIcon className="size-4" />
        {label}
      </AISearchTrigger>
      <AISearchPanel />
    </AISearch>,
    document.body,
  );
}
