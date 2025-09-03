import { pool } from "@/lib/db";

/**
 * GET /api/leaderboard
 * Returns rows sorted by score DESC
 */
export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, score FROM leaderboard ORDER BY score DESC"
    );

    // Next.js Response helper returns JSON with correct headers
    return Response.json(rows, { status: 200 });
  } catch (err) {
    console.error("Leaderboard query failed:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
