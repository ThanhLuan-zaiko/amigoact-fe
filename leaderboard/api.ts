import { apiFetch } from "../core/api.ts";

export interface LeaderboardEntry {
  student_id: string;
  student_name: string | null;
  total_hours: number;
  rank: number;
}

export interface LeaderboardResponse {
  term: string;
  entries: LeaderboardEntry[];
}

export function fetchLeaderboard(
  term = "all",
  limit = 50,
): Promise<LeaderboardResponse> {
  const params = new URLSearchParams({
    term,
    limit: String(limit),
  });
  return apiFetch<LeaderboardResponse>(`/leaderboard?${params}`);
}

export function fetchLeaderboardTerms(): Promise<string[]> {
  return apiFetch<string[]>("/leaderboard/terms");
}
