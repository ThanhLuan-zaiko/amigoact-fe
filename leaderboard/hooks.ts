import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import {
  fetchLeaderboard,
  fetchLeaderboardTerms,
  type LeaderboardResponse,
} from "./api.ts";
import { leaderboardKeys } from "./keys.ts";

export function useLeaderboard(
  term: string,
): UseQueryResult<LeaderboardResponse, ApiError> {
  return useQuery({
    queryKey: leaderboardKeys.board(term),
    queryFn: () => fetchLeaderboard(term),
    staleTime: 60_000,
  });
}

export function useLeaderboardTerms(): UseQueryResult<
  string[],
  ApiError
> {
  return useQuery({
    queryKey: leaderboardKeys.terms(),
    queryFn: fetchLeaderboardTerms,
    staleTime: 300_000,
  });
}
