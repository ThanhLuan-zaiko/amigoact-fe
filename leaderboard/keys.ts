export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  board: (term: string) => [...leaderboardKeys.all, term] as const,
  terms: () => [...leaderboardKeys.all, "terms"] as const,
};
