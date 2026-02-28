import type { I18nConfig } from "fumadocs-core/i18n";

export const supportedLocales = ["en", "pt-BR"] as const;
export type SupportedLocale = (typeof supportedLocales)[number];

export const i18n: I18nConfig = {
  languages: [...supportedLocales],
  defaultLanguage: "en",
  hideLocale: "default-locale"
};

export const localeLabels: Record<string, string> = {
  en: "English",
  "pt-BR": "Português (Brasil)"
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}
