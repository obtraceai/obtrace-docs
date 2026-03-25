import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MermaidDiagram } from "./components/mermaid-diagram";

interface NodeWithProps {
  props: { className?: string; children?: ReactNode; "data-title"?: string };
}

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return extractText((children as NodeWithProps).props.children);
  }
  return "";
}

function isMermaidBlock(node: unknown): node is NodeWithProps {
  if (!node || typeof node !== "object" || !("props" in node)) return false;
  return (node as NodeWithProps).props?.className === "language-mermaid";
}

function MermaidPre(props: ComponentPropsWithoutRef<"pre">) {
  const child = props.children;
  if (isMermaidBlock(child)) {
    const chart = extractText(child.props.children).trim();
    if (chart) {
      return <MermaidDiagram chart={chart} title={child.props["data-title"]} />;
    }
  }
  const Pre = defaultMdxComponents.pre ?? "pre";
  return <Pre {...props} />;
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    pre: MermaidPre,
    ...components
  };
}
