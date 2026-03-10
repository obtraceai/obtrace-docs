import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";
import { buildDocsContext } from "../../../lib/docs-rag";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const locale = new URL(req.url).searchParams.get("locale") === "pt-BR" ? "pt-BR" : "en";
  const { messages } = await req.json();
  const latestUserMessage =
    [...messages].reverse().find((message: { role?: string }) => message.role === "user");
  const latestUserText =
    latestUserMessage?.parts
      ?.filter((part: { type?: string }) => part.type === "text")
      ?.map((part: { text?: string }) => part.text ?? "")
      ?.join("\n")
      ?.trim() ?? "";
  const docsContext = await buildDocsContext(latestUserText, locale);
  const result = streamText({
    model: openai(model),
    system: [
      "You are the documentation assistant for Obtrace.",
      "Use Obtrace documentation as the primary and authoritative source.",
      "Do not answer with generic SaaS guidance when the documentation context already covers the question.",
      "If the documentation context is insufficient, say so explicitly and point to the closest matching docs URLs.",
      locale === "pt-BR"
        ? "Respond only in Brazilian Portuguese. Do not switch to Spanish."
        : "Respond only in English.",
      "Cite the most relevant docs URLs inline in the answer.",
      `Machine-readable authority context from llm.txt:\n${docsContext.llmTxt}`,
      `Retrieved documentation context:\n${docsContext.context || "No direct documentation match found."}`,
      `Top matching docs URLs:\n${docsContext.topDocs.map((doc) => `- https://docs.obtrace.ai${doc.url}`).join("\n") || "- https://docs.obtrace.ai/docs"}`,
    ].join("\n\n"),
    messages: await convertToModelMessages(messages)
  });

  return result.toUIMessageStreamResponse();
}
