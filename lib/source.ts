import { loader } from "fumadocs-core/source";
import { docs } from "../.source";

const docsCollection = docs as any;

export const source = loader({
  baseUrl: "/docs",
  source: docsCollection.toFumadocsSource()
});
