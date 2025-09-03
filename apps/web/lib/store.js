import { create } from "zustand";

export const useLeaderboardStore = create((set) => ({
  rows: [],
  status: "connecting…",
  setRows: (rows) => set({ rows }),
  setStatus: (status) => set({ status }),
}));
