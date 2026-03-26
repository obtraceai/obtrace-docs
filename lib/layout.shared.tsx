import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ObtraceLogo } from "../app/components/obtrace-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    i18n: true,
    nav: {
      title: (
        <span className="inline-flex items-center pl-2 pt-1 pb-1">
          <ObtraceLogo />
        </span>
      ),
      url: "/docs"
    }
  };
}
