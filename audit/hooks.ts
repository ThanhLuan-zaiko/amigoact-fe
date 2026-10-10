import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "../core/api.ts";
import { listOrgAudit, type AuditEntry } from "./api.ts";

export const auditKeys = {
  all: ["audit"] as const,
  org: (orgId: string) => [...auditKeys.all, orgId] as const,
};

export function useOrgAudit(
  orgId: string | undefined,
): UseQueryResult<AuditEntry[], ApiError> {
  return useQuery({
    queryKey: auditKeys.org(orgId ?? ""),
    queryFn: () => listOrgAudit(orgId ?? ""),
    enabled: Boolean(orgId),
    staleTime: 15_000,
  });
}
