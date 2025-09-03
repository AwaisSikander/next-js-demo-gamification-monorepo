export const runtime = "nodejs";
// make sure this never gets cached
export const dynamic = "force-dynamic";

import { pool } from "@/lib/db";

export async function GET(req) {
  const client = await pool.connect();
  const encoder = new TextEncoder();

  // Listening "leaderboard" channel
  await client.query("LISTEN leaderboard");

  let cleaned = false;
  const cleanup = async () => {
    if (cleaned) return;
    cleaned = true;
    try {
      await client.query("UNLISTEN leaderboard");
    } catch {}
    client.removeAllListeners("notification");
    client.release();
  };

  const stream = new ReadableStream({
    start(controller) {
      const send = (obj) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      };

      send({ type: "connected" });

      const onNotify = (msg) => {
        if (msg.channel === "leaderboard") {
          send({ type: "leaderboard_changed" });
        }
      };

      client.on("notification", onNotify);

      // Keep-alive
      const ping = setInterval(() => send({ type: "ping" }), 25000);

      const close = async () => {
        clearInterval(ping);
        await cleanup();
        controller.close();
      };

      // Abort if client disconnects
      const signal = req?.signal;
      if (signal) {
        const onAbort = () => close();
        signal.addEventListener("abort", onAbort, { once: true });
      }

      // Save for cancel()
      this._close = close;
    },
    async cancel() {
      if (this._close) await this._close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
