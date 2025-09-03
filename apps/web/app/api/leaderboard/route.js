export const runtime = "nodejs";

import { pool } from "@/lib/db";
import { trace } from "@opentelemetry/api";

const tracer = trace.getTracer("web");

export async function GET() {
  return await tracer.startActiveSpan("leaderboard.query", async (span) => {
    try {
      const { rows } = await pool.query(
        "SELECT id, name, score FROM leaderboard ORDER BY score DESC"
      );
      span.setAttribute("db.system", "postgresql");
      span.setAttribute("app.rows.count", rows.length);
      return Response.json(rows, { status: 200 });
    } catch (err) {
      span.recordException(err);
      span.setAttribute("error", true);
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
      span.end();
    }
  });
}
