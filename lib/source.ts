import { loader } from "fumadocs-core/source";
import { docs } from "../.source";
import { i18n } from "./i18n";
import { createElement } from "react";
import { BookOpen, Code2, Boxes, PlugZap, Rocket, Info, KeyRound, Route, Sparkles, Compass, Scale, Wrench } from "lucide-react";

const docsCollection = docs as any;
const iconMap = {
  BookOpen,
  Code2,
  Boxes,
  PlugZap,
  Rocket,
  Info,
  KeyRound,
  Route,
  Sparkles,
  Compass,
  Scale,
  Wrench
} as const;

export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: docsCollection.toFumadocsSource(),
  icon(icon) {
    if (!icon) return undefined;
    const Icon = iconMap[icon as keyof typeof iconMap];
    return Icon ? createElement(Icon, { className: "size-4" }) : undefined;
  }
});
