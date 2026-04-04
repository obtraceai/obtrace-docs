import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider";
import { DOCS_OG_IMAGE_EN, DOCS_SITE_URL } from "../lib/metadata";
import "./styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(DOCS_SITE_URL),
  title: {
    default: "Obtrace Docs",
    template: "%s | Obtrace Docs"
  },
  description:
    "Documentation for Obtrace SDKs, concepts, environments, security model, and APIs for AI-native observability and auto-remediation.",
  keywords: [
    "obtrace docs",
    "aiops docs",
    "auto-remediation docs",
    "observability sdk docs",
    "root cause analysis docs"
  ],
  alternates: {
    canonical: "/docs"
  },
  openGraph: {
    title: "Obtrace Docs",
    description:
      "Documentation for Obtrace SDKs, concepts, environments, security model, and APIs for AI-native observability and auto-remediation.",
    url: `${DOCS_SITE_URL}/docs`,
    siteName: "Obtrace Docs",
    type: "website",
    images: [DOCS_OG_IMAGE_EN]
  },
  twitter: {
    card: "summary_large_image",
    title: "Obtrace Docs",
    description:
      "Documentation for Obtrace SDKs, concepts, environments, security model, and APIs for AI-native observability and auto-remediation.",
    images: [DOCS_OG_IMAGE_EN]
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: "/apple-touch-icon.png"
  }
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          theme={{
            attribute: "class",
            defaultTheme: "dark",
            enableSystem: true
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
