import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ObtraceLogo } from "../app/components/obtrace-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    i18n: true,
    nav: {
      title: (
        <span className="obtrace-docs-title inline-flex max-w-[min(44vw,192px)] items-center overflow-hidden">
          <ObtraceLogo />
        </span>
      ),
      url: "/docs"
    }
  };
}
