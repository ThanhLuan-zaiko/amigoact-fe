import { apiFetch } from "../core/api.ts";
import type { AttendanceRecord } from "./api.ts";

export interface AttendanceSession {
  session_id: string;
  schedule_id: string;
  title: string;
  qr_code: string;
  opens_at: string | null;
  closes_at: string | null;
  status: string;
}

export interface SessionInput {
  title: string;
  opens_at?: string | null;
  closes_at?: string | null;
  max_uses?: number | null;
}

export interface ScanLogItem {
  scanned_at: string | null;
  student_id: string;
  result: string;
  device_info: string | null;
}

export function listSessions(
  activityId: string,
): Promise<AttendanceSession[]> {
  return apiFetch<AttendanceSession[]>(
    `/activities/${activityId}/sessions`,
  );
}

export function createSession(
  activityId: string,
  scheduleId: string,
  input: SessionInput,
): Promise<AttendanceSession> {
  return apiFetch<AttendanceSession>(
    `/activities/${activityId}/schedules/${scheduleId}/sessions`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function transitionSession(
  activityId: string,
  scheduleId: string,
  sessionId: string,
  action: "open" | "closed",
): Promise<AttendanceSession> {
  return apiFetch<AttendanceSession>(
    `/activities/${activityId}/schedules/${scheduleId}/sessions/${sessionId}/${action}`,
    { method: "POST" },
  );
}

export function listScans(
  activityId: string,
  sessionId: string,
): Promise<ScanLogItem[]> {
  return apiFetch<ScanLogItem[]>(
    `/activities/${activityId}/sessions/${sessionId}/scans`,
  );
}

export function scanCode(
  code: string,
  deviceInfo?: string,
): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>("/attendance/scan", {
    method: "POST",
    body: JSON.stringify({
      code,
      device_info: deviceInfo ?? null,
    }),
  });
}
