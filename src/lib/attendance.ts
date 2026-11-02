// Shapes of the attendance API responses.

export type AttendanceSession = {
  id: string;
  title: string | null;
  shift_id: string | null;
  shift_title: string | null;
  is_open: boolean;
  opens_at: string | null;
  closes_at: string | null;
  manual_code: string | null;
  qr_token: string | null;
  checked_in_count: number;
  pending_count: number;
};

export type RosterEntry = {
  registration_id: string;
  full_name: string;
  record_id: string | null;
  method: "qr" | "manual" | null;
  scanned_at: string | null;
  verified: boolean;
};

export type CheckInResult = {
  status: "accepted" | "pending_review";
  activity_id: string;
  activity_title: string;
  session_title: string | null;
};

export type Appeal = {
  id: string;
  user_id: string;
  full_name: string;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  resolved_at: string | null;
  registrations: { registration_id: string; shift_title: string | null }[];
};

export type HourEntry = {
  id: string;
  hours: number;
  source: "attendance" | "manual" | "adjustment";
  term: string | null;
  note: string | null;
  recorded_at: string;
  activity_id: string | null;
  activity_title: string | null;
  organization_name: string | null;
};

export type MyHours = {
  total: number;
  by_term: { term: string; hours: number }[];
  entries: HourEntry[];
};

export type ActivityHours = {
  user_id: string;
  full_name: string;
  hours: number;
};

export type HourRule = {
  multiplier: number;
  cap_hours: number | null;
};

export const SESSION_MINUTES = [15, 30, 60, 120, 240, 480];

export const APPEAL_STATUS_LABELS: Record<Appeal["status"], string> = {
  pending: "Chờ xử lý",
  approved: "Đã chấp nhận",
  rejected: "Đã từ chối",
};

// "2.5h", with a plus sign when showing a change in the ledger.
export function hoursText(hours: number, { signed = false } = {}): string {
  const sign = signed && hours > 0 ? "+" : "";
  return `${sign}${hours}h`;
}

// Where a scanned QR leads. A configured address wins, for phones outside this machine.
export function checkInUrl(
  configuredOrigin: string | undefined,
  requestOrigin: string,
  token: string,
): string {
  const origin = (configuredOrigin || requestOrigin).replace(/\/+$/, "");
  return `${origin}/checkin?token=${encodeURIComponent(token)}`;
}
