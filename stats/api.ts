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

export interface DailyStats {
  day: string;
  registrations: number;
  attendees: number;
  hours_awarded: number;
}

export interface MonthlyStats {
  month: string;
  activities: number;
  participants: number;
  hours: number;
  certificates: number;
}

export function getDailyStats(
  activityId: string,
): Promise<DailyStats[]> {
  return apiFetch<DailyStats[]>(
    `/activities/${activityId}/stats/daily`,
  );
}

export function getMonthlyStats(
  orgId: string,
): Promise<MonthlyStats[]> {
  return apiFetch<MonthlyStats[]>(`/orgs/${orgId}/stats/monthly`);
}
