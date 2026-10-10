import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { getOrgStats, type OrgStats } from "./api.ts";

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
