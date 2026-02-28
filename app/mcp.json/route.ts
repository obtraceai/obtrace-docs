import { promises as fs } from "node:fs";
import path from "node:path";

export async function GET(request: Request) {
  const filePath = path.join(process.cwd(), "mcp.json");
  const content = await fs.readFile(filePath, "utf8");
  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(content, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(download ? { "Content-Disposition": "attachment; filename=\"mcp.json\"" } : {}),
      "Cache-Control": "public, max-age=300"
    }
  });
}
