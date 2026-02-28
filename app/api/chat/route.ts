import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText } from "ai";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response("Missing OPENAI_API_KEY", { status: 500 });
  }

  const { messages } = await req.json();
  const result = streamText({
    model: openai(model),
    messages: await convertToModelMessages(messages)
  });

  return result.toUIMessageStreamResponse();
}
