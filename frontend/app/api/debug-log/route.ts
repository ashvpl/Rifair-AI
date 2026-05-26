import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const LOG_PATH = join(process.cwd(), "..", ".cursor", "debug-33be9b.log");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    mkdirSync(join(process.cwd(), "..", ".cursor"), { recursive: true });
    appendFileSync(LOG_PATH, `${JSON.stringify(body)}\n`);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
