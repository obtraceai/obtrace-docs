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
        className="gap-2 rounded-full border border-[hsl(220,12%,18%)]/80 bg-[hsl(222,22%,6%)] px-4 py-3 text-sm font-semibold text-[hsl(210,25%,92%)] shadow-2xl shadow-black/40 hover:bg-[hsl(220,16%,12%)]"
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
