import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET(request: Request) {
  const filePath = path.join(process.cwd(), "llm.txt");
  const content = await fs.readFile(filePath, "utf8");
  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(download ? { "Content-Disposition": "attachment; filename=\"llm.txt\"" } : {}),
      "Cache-Control": "public, max-age=300"
    }
  });
}
