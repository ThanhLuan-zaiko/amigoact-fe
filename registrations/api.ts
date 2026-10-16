import { apiFetch } from "../core/api.ts";

export interface Registration {
  registration_id: string;
  activity_id: string;
  student_id: string;
  status: string;
  note: string | null;
  review_note: string | null;
  registered_at: string | null;
  reviewed_at: string | null;
  cancelled_at: string | null;
  slot_id: string | null;
}

export interface RosterItem {
  registration_id: string;
  student_id: string;
  student_name: string;
  student_email: string | null;
  status: string;
  note: string | null;
  review_note: string | null;
  registered_at: string | null;
  form_data?: Record<string, string> | null;
  slot_id?: string | null;
}

export interface HistoryEntry {
  from_status: string | null;
  to_status: string;
  changed_at: string | null;
  changed_by: string | null;
  note: string | null;
}

export interface Ticket {
  registration_id: string;
  checkin_token: string;
  activity_id: string;
  status: string;
}

export interface AttendanceRecord {
  record_id: string;
  activity_id: string;
  student_id: string;
  session_id: string | null;
  method: string | null;
  scanned_at: string | null;
  checked_out_at: string | null;
  check_out_method: string | null;
  actual_hours: number | null;
}

export function applyToActivity(
  activityId: string,
  note?: string,
  formData?: Record<string, string>,
  slotId?: string,
): Promise<Registration> {
  return apiFetch<Registration>(`/activities/${activityId}/registrations`, {
    method: "POST",
    body: JSON.stringify({
      note: note ?? null,
      form_data: formData ?? null,
      slot_id: slotId ?? null,
    }),
  });
}

export function listMyRegistrations(): Promise<Registration[]> {
  return apiFetch<Registration[]>("/registrations/mine");
}

export function listActivityRoster(
  activityId: string,
): Promise<RosterItem[]> {
  return apiFetch<RosterItem[]>(`/activities/${activityId}/registrations`);
}

export function reviewRegistration(
  activityId: string,
  registrationId: string,
  status: string,
  reviewNote?: string,
): Promise<Registration> {
  return apiFetch<Registration>(
    `/activities/${activityId}/registrations/${registrationId}/review`,
    {
      method: "POST",
      body: JSON.stringify({ status, review_note: reviewNote ?? null }),
    },
  );
}

export function cancelRegistration(
  activityId: string,
  registrationId: string,
): Promise<Registration> {
  return apiFetch<Registration>(
    `/activities/${activityId}/registrations/${registrationId}/cancel`,
    { method: "POST" },
  );
}

export function listRegistrationHistory(
  activityId: string,
  registrationId: string,
): Promise<HistoryEntry[]> {
  return apiFetch<HistoryEntry[]>(
    `/activities/${activityId}/registrations/${registrationId}/history`,
  );
}

export function getTicket(
  activityId: string,
  registrationId: string,
): Promise<Ticket> {
  return apiFetch<Ticket>(
    `/activities/${activityId}/registrations/${registrationId}/ticket`,
  );
}

export function checkInByToken(
  activityId: string,
  checkinToken: string,
): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>(`/activities/${activityId}/checkin`, {
    method: "POST",
    body: JSON.stringify({ checkin_token: checkinToken }),
  });
}

export function checkInManual(
  activityId: string,
  registrationId: string,
): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>(
    `/activities/${activityId}/registrations/${registrationId}/checkin`,
    { method: "POST" },
  );
}

export function checkOut(
  activityId: string,
  recordId: string,
  actualHours?: number,
): Promise<AttendanceRecord> {
  return apiFetch<AttendanceRecord>(
    `/activities/${activityId}/attendance/${recordId}/checkout`,
    {
      method: "POST",
      body: JSON.stringify({ actual_hours: actualHours ?? null }),
    },
  );
}

export function listActivityAttendance(
  activityId: string,
): Promise<AttendanceRecord[]> {
  return apiFetch<AttendanceRecord[]>(`/activities/${activityId}/attendance`);
}

export function listMyAttendance(): Promise<AttendanceRecord[]> {
  return apiFetch<AttendanceRecord[]>("/attendance/mine");
}
