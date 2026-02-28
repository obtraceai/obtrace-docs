import { loader } from "fumadocs-core/source";
import { docs } from "../.source";
import { i18n } from "./i18n";

const docsCollection = docs as any;

export const source = loader({
  baseUrl: "/docs",
  i18n,
  source: docsCollection.toFumadocsSource()
});
