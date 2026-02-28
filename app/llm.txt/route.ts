import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET() {
  const filePath = path.join(process.cwd(), "llm.txt");
  const content = await fs.readFile(filePath, "utf8");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}
