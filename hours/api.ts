import { apiFetch } from "../core/api.ts";

export interface HourEntry {
  entry_id: string;
  student_id: string;
  activity_id: string;
  source: string;
  hours: number;
  term: string;
  status: string;
  note: string | null;
  recorded_at: string | null;
  approved_at: string | null;
}

export interface MyLedgerItem {
  entry_id: string;
  activity_id: string;
  source: string | null;
  hours: number | null;
  status: string | null;
  recorded_at: string;
}

export interface HoursSummary {
  term: string;
  total_hours: number;
  activities_count: number;
}

export interface MyHours {
  entries: MyLedgerItem[];
  summaries: HoursSummary[];
}

export function submitManualHours(
  orgId: string,
  input: {
    student_id: string;
    activity_id: string;
    hours: number;
    note?: string;
  },
): Promise<HourEntry> {
  return apiFetch<HourEntry>(`/orgs/${orgId}/hours`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listActivityHours(
  orgId: string,
  activityId: string,
): Promise<HourEntry[]> {
  return apiFetch<HourEntry[]>(
    `/orgs/${orgId}/activities/${activityId}/hours`,
  );
}

export function reviewHours(
  entryId: string,
  status: string,
  note?: string,
): Promise<HourEntry> {
  return apiFetch<HourEntry>(`/hours/${entryId}/review`, {
    method: "POST",
    body: JSON.stringify({ status, note: note ?? null }),
  });
}

export function getMyHours(): Promise<MyHours> {
  return apiFetch<MyHours>("/hours/mine");
}
