"use client";

import type { ReactNode } from "react";
import { I18nProvider } from "fumadocs-ui/i18n";
import { localeLabels } from "../../lib/i18n";

type Props = {
  locale: string;
  children: ReactNode;
};

export function DocsI18nProvider({ locale, children }: Props) {
  const locales = Object.entries(localeLabels).map(([localeCode, name]) => ({
    locale: localeCode,
    name
  }));

  const translations =
    locale === "pt-BR"
      ? {
          search: "Pesquisar",
          searchNoResult: "Nenhum resultado encontrado",
          toc: "Nesta página",
          tocNoHeadings: "Sem títulos nesta página",
          lastUpdate: "Última atualização",
          chooseLanguage: "Escolher idioma",
          nextPage: "Próxima página",
          previousPage: "Página anterior",
          chooseTheme: "Escolher tema",
          editOnGithub: "Editar no GitHub"
        }
      : undefined;

  return (
    <I18nProvider locale={locale} locales={locales} translations={translations}>
      {children}
    </I18nProvider>
  );
}
