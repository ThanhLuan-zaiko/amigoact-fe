import { apiFetch } from "../core/api.ts";

export interface OrgStats {
  activities_total: number;
  members_total: number;
  participants_total: number;
  hours_approved: number;
  hours_pending: number;
  certificates_issued: number;
}

export function getOrgStats(orgId: string): Promise<OrgStats> {
  return apiFetch<OrgStats>(`/orgs/${orgId}/stats`);
}
