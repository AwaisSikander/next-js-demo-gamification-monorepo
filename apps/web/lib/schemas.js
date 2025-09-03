import { z } from "zod";

export const LeaderboardRow = z.object({
  id: z.number(),
  name: z.string(),
  score: z.number(),
});

export const Leaderboard = z.array(LeaderboardRow);
