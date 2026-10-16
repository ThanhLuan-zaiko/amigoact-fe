import { apiFetch } from "../core/api.ts";

export interface HourRule {
  rule_id: string;
  org_id: string;
  category_id: string | null;
  multiplier: number | null;
  cap_hours: number | null;
  term: string | null;
  is_active: boolean | null;
}

export interface HourRuleInput {
  multiplier: number;
  category_id?: string | null;
  cap_hours?: number | null;
  term?: string | null;
}

export interface HourAdjustment {
  adjustment_id: string;
  student_id: string;
  activity_id: string;
  delta_hours: number;
  reason: string | null;
  created_by: string | null;
  created_at: string | null;
}

export function listHourRules(orgId: string): Promise<HourRule[]> {
  return apiFetch<HourRule[]>(`/orgs/${orgId}/hour-rules`);
}

export function createHourRule(
  orgId: string,
  input: HourRuleInput,
): Promise<HourRule> {
  return apiFetch<HourRule>(`/orgs/${orgId}/hour-rules`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function toggleHourRule(
  orgId: string,
  ruleId: string,
  isActive: boolean,
): Promise<HourRule> {
  return apiFetch<HourRule>(
    `/orgs/${orgId}/hour-rules/${ruleId}`,
    { method: "PATCH", body: JSON.stringify({ is_active: isActive }) },
  );
}

export function adjustHours(
  orgId: string,
  input: {
    student_id: string;
    activity_id: string;
    delta_hours: number;
    reason: string;
  },
): Promise<HourAdjustment> {
  return apiFetch<HourAdjustment>(`/orgs/${orgId}/hours/adjust`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
