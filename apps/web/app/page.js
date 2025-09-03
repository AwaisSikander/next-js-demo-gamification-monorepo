"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setRows);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Leaderboard (Postgres)</h1>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.id} className="border rounded px-3 py-2">
            <span className="font-medium">{r.name}</span> — {r.score}
          </li>
        ))}
      </ul>
    </div>
  );
}
