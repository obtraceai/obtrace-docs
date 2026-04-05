"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    chatwootSettings?: Record<string, unknown>;
    chatwootSDK?: { run: (config: { websiteToken: string; baseUrl: string }) => void };
    $chatwoot?: {
      setLocale: (locale: string) => void;
      setCustomAttributes: (attrs: Record<string, string>) => void;
    };
  }
}

const CHATWOOT_BASE_URL = (process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || "https://chat.obtrace.ai").replace(/\/$/, "");
const CHATWOOT_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || "";

const localeToChatwoot: Record<string, string> = {
  en: "en",
  "pt-BR": "pt_BR",
  es: "es",
  fr: "fr",
};

export function ChatwootWidget({ locale = "en" }: { locale?: string }) {
  useEffect(() => {
    if (!CHATWOOT_TOKEN) return;

    window.chatwootSettings = {
      hideMessageBubble: false,
      position: "right",
      locale: localeToChatwoot[locale] || "en",
      type: "standard",
      launcherTitle: locale === "pt-BR" ? "Fale conosco" : locale === "es" ? "Habla con nosotros" : locale === "fr" ? "Parlez-nous" : "Talk to us",
    };

    const script = document.createElement("script");
    script.src = `${CHATWOOT_BASE_URL}/packs/js/sdk.js`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.chatwootSDK?.run({
        websiteToken: CHATWOOT_TOKEN,
        baseUrl: CHATWOOT_BASE_URL,
      });

      window.$chatwoot?.setCustomAttributes({
        site: "docs",
        locale,
      });
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [locale]);

  return null;
}
