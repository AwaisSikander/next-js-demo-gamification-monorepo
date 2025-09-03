"use client";

import { useEffect, useRef } from "react";
import { useLeaderboardStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Leaderboard } from "@/lib/schemas";

const tableVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 70, // lower = softer/slower
      damping: 14, // higher = less bounce
      mass: 1.05,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

function useThrottle(ms = 250) {
  const timerRef = useRef(null);
  return (fn) => {
    if (timerRef.current) return;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      fn();
    }, ms);
  };
}

export default function Page() {
  const { rows, status, setRows, setStatus } = useLeaderboardStore();
  const throttle = useThrottle(250);

  async function fetchLeaderboard() {
    const res = await fetch("/api/leaderboard", { cache: "no-store" });
    const data = await res.json();
    const parsed = Leaderboard.safeParse(data);
    if (!parsed.success) {
      console.error("Invalid leaderboard payload:", parsed.error.format());
      return;
    }
    throttle(() => setRows(parsed.data));
  }

  useEffect(() => {
    fetchLeaderboard();

    // open SSE for realtime re-fetch on change
    const es = new EventSource("/api/events");
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === "connected") setStatus("live");
        if (payload.type === "leaderboard_changed") fetchLeaderboard();
      } catch {}
    };
    es.onerror = () => setStatus("reconnecting…");
    return () => es.close();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-2 text-sm opacity-70">Status: {status}</div>
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      <table className="min-w-full border border-[var(--foreground)]">
        <thead className="bg-[var(--foreground)] text-[var(--background)]">
          <tr>
            <th className="px-4 py-2 border border-[var(--foreground)]">ID</th>
            <th className="px-4 py-2 border border-[var(--foreground)]">
              Name
            </th>
            <th className="px-4 py-2 border border-[var(--foreground)]">
              Score
            </th>
          </tr>
        </thead>

        <motion.tbody
          variants={tableVariants}
          initial="initial"
          animate="animate"
          layout
        >
          <AnimatePresence initial={false}>
            {rows.map((row) => (
              <motion.tr
                key={row.id}
                variants={rowVariants}
                layout
                className="odd:bg-[var(--background)] even:bg-[var(--background)]"
              >
                <td className="px-4 py-2 border border-[var(--foreground)]">
                  {row.id}
                </td>
                <td className="px-4 py-2 border border-[var(--foreground)]">
                  {row.name}
                </td>
                <td className="px-4 py-2 border border-[var(--foreground)]">
                  {row.score}
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </motion.tbody>
      </table>

      <p className="text-sm mt-2 opacity-70">
        Live updates via Postgres LISTEN/NOTIFY
      </p>
    </div>
  );
}
