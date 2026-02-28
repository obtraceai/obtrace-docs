import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { ObtraceLogo } from "../components/obtrace-logo";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ObtraceLogo width={120} height={40} />
          <span>Docs</span>
        </span>
      )
    },
    links: [
      {
        text: "Downloads",
        url: "/docs/downloads",
        active: "nested-url"
      },
      {
        text: "Reference",
        url: "/docs/reference",
        active: "nested-url"
      },
      {
        text: "Fumadocs",
        url: "https://www.fumadocs.dev/docs/comparisons",
        external: true
      }
    ]
  };
}
