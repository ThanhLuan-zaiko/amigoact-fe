import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { getDailyStats, getMonthlyStats, getOrgStats, type DailyStats, type MonthlyStats, type OrgStats } from "./api.ts";

export const statsKeys = {
  all: ["stats"] as const,
  org: (orgId: string) => [...statsKeys.all, orgId] as const,
};

export function useOrgStats(
  orgId: string | undefined,
): UseQueryResult<OrgStats, ApiError> {
  return useQuery({
    queryKey: statsKeys.org(orgId ?? ""),
    queryFn: () => getOrgStats(orgId ?? ""),
    enabled: Boolean(orgId),
    staleTime: 30_000,
  });
}

export function useDailyStats(
  activityId: string | undefined,
): UseQueryResult<DailyStats[], ApiError> {
  return useQuery({
    queryKey: [...statsKeys.all, "daily", activityId ?? ""],
    queryFn: () => getDailyStats(activityId ?? ""),
    enabled: Boolean(activityId),
    staleTime: 60_000,
  });
}

export function useMonthlyStats(
  orgId: string | undefined,
): UseQueryResult<MonthlyStats[], ApiError> {
  return useQuery({
    queryKey: [...statsKeys.all, "monthly", orgId ?? ""],
    queryFn: () => getMonthlyStats(orgId ?? ""),
    enabled: Boolean(orgId),
    staleTime: 60_000,
  });
}
