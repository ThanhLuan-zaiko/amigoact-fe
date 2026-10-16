import { apiFetch } from "../core/api.ts";

export interface AttendanceAppeal {
  activity_id: string;
  student_id: string;
  appeal_id: string;
  record_id: string | null;
  reason: string;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string | null;
}

export interface AttendanceSummary {
  registration_id: string;
  activity_id: string;
  student_id: string;
  sessions_total: number;
  sessions_attended: number;
  minutes_attended: number;
  status: string;
  updated_at: string | null;
}

export function fileAppeal(
  activityId: string,
  reason: string,
  recordId?: string | null,
): Promise<AttendanceAppeal> {
  return apiFetch<AttendanceAppeal>(
    `/activities/${activityId}/appeals`,
    {
      method: "POST",
      body: JSON.stringify({ reason, record_id: recordId ?? null }),
    },
  );
}

export function listAppeals(
  activityId: string,
): Promise<AttendanceAppeal[]> {
  return apiFetch<AttendanceAppeal[]>(
    `/activities/${activityId}/appeals`,
  );
}

export function listMyAppeals(
  activityId: string,
): Promise<AttendanceAppeal[]> {
  return apiFetch<AttendanceAppeal[]>(
    `/activities/${activityId}/appeals/mine`,
  );
}

export function resolveAppeal(
  activityId: string,
  studentId: string,
  appealId: string,
  status: "approved" | "rejected",
): Promise<AttendanceAppeal> {
  return apiFetch<AttendanceAppeal>(
    `/activities/${activityId}/appeals/${studentId}/${appealId}/resolve`,
    { method: "POST", body: JSON.stringify({ status }) },
  );
}

export function getSummary(
  activityId: string,
  registrationId: string,
): Promise<AttendanceSummary> {
  return apiFetch<AttendanceSummary>(
    `/activities/${activityId}/registrations/${registrationId}/summary`,
  );
}
