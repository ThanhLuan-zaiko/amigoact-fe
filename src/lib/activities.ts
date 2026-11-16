// Shapes of the activity API responses, with their labels and time helpers.

import type { CardPicture } from "./focus";
import {
  dateFormat,
  isoOffset,
  wallClock,
  zonedInstant,
  zoneLabel,
  zoneOffsetMinutes,
} from "./timeZone";

export type ActivityStatus = "draft" | "published" | "completed" | "cancelled";
export type RegistrationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "waitlisted"
  | "cancelled"
  | "attended";

export type ActivitySummary = {
  id: string;
  title: string;
  status: ActivityStatus;
  start_at: string | null;
  end_at: string | null;
  registration_deadline: string | null;
  location: string | null;
  city: string | null;
  is_remote: boolean;
  hours_awarded: number | null;
  requires_approval: boolean;
  capacity: number | null;
  seats_taken: number;
  organization_name: string;
  organization_slug: string;
  tags?: string[];
  // Lists only: the first picture of the newest public post about the activity,
  // else the organization cover.
  picture?: CardPicture | null;
};

export type ActivityPage = {
  items: ActivitySummary[];
  next_offset: number | null;
  total: number;
};

export type Shift = {
  id: string;
  title: string | null;
  start_at: string | null;
  end_at: string | null;
  capacity: number | null;
  seats_taken: number;
};

export type ViewerRegistration = {
  id: string;
  shift_id: string | null;
  status: RegistrationStatus;
  review_note: string | null;
  waitlist_position: number | null;
};

export type ActivityDetail = ActivitySummary & {
  description: string | null;
  address: string | null;
  max_participants: number | null;
  published_at: string | null;
  waitlist_count: number;
  registration_open: boolean;
  can_cancel_registration: boolean;
  shifts: Shift[];
  viewer: {
    can_manage: boolean;
    registrations: ViewerRegistration[];
  };
};

export type MyRegistration = {
  id: string;
  status: RegistrationStatus;
  note: string | null;
  review_note: string | null;
  registered_at: string;
  waitlist_position: number | null;
  shift_title: string | null;
  can_cancel: boolean;
  attendance: "verified" | "pending" | null;
  can_appeal: boolean;
  appeal_status: "pending" | "approved" | "rejected" | null;
  activity_id: string;
  activity_title: string;
  activity_status: ActivityStatus;
  start_at: string | null;
  location: string | null;
  organization_name: string;
};

export type ActivityRegistration = {
  id: string;
  user_id: string;
  full_name: string;
  status: RegistrationStatus;
  note: string | null;
  review_note: string | null;
  shift_id: string | null;
  shift_title: string | null;
  registered_at: string;
};

export type RegistrationPage = {
  items: ActivityRegistration[];
  next_offset: number | null;
  total: number;
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  draft: "Bản nháp",
  published: "Đang mở",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  waitlisted: "Chờ chỗ",
  cancelled: "Đã hủy",
  attended: "Đã tham dự",
};

// Times are written on the viewer's clock. `timeZone` is an IANA zone; leave it
// out on a phone or in the browser to use the device zone. Server code must pass
// the viewer's zone, because the server's own zone means nothing to the viewer.
const DATE_TIME: Intl.DateTimeFormatOptions = {
  dateStyle: "short",
  timeStyle: "short",
};

function validDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "14:05 16/11/26".
export function formatDateTime(
  value: string | null,
  timeZone?: string,
): string {
  const date = validDate(value);
  return date ? dateFormat("vi-VN", DATE_TIME, timeZone).format(date) : "";
}

// "14:05 16/11/26 (GMT+7)": with the zone named, for times people plan around
// (start, end, registration deadline, attendance), so nobody reads them on the
// wrong clock.
export function formatDateTimeZoned(
  value: string | null,
  timeZone?: string,
): string {
  const date = validDate(value);
  return date
    ? `${formatDateTime(value, timeZone)} (${zoneLabel(date, timeZone)})`
    : "";
}

// "14:05 16/11/26 – 17:00 16/11/26 (GMT+7)". When a clock change falls between
// the two ends, each end names its own offset.
export function formatTimeRange(
  start: string | null,
  end: string | null,
  timeZone?: string,
): string {
  const from = validDate(start);
  const to = validDate(end);
  if (!from || !to) {
    return from
      ? formatDateTimeZoned(start, timeZone)
      : formatDateTimeZoned(end, timeZone);
  }
  const fromZone = zoneLabel(from, timeZone);
  const toZone = zoneLabel(to, timeZone);
  const first = formatDateTime(start, timeZone);
  const last = formatDateTime(end, timeZone);
  return fromZone === toZone
    ? `${first} – ${last} (${toZone})`
    : `${first} (${fromZone}) – ${last} (${toZone})`;
}

function pad(value: number, size = 2): string {
  return String(value).padStart(size, "0");
}

// A datetime-local input has no zone: it holds the wall clock of the person
// typing. `timeZone` is that person's zone (the device zone when left out).
export function toLocalInput(value: string | null, timeZone?: string): string {
  const date = validDate(value);
  if (!date) {
    return "";
  }
  const wall = wallClock(date, timeZone);
  return `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}`;
}

const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

// The input value as an ISO 8601 moment with the zone's offset at that time,
// such as "2026-06-15T08:00:00+07:00". Anything that is not a real date and time
// is sent as typed, so the backend refuses it with a clear error.
export function fromLocalInput(
  value: string,
  timeZone?: string,
): string | null {
  if (!value) {
    return null;
  }
  const match = LOCAL_INPUT.exec(value);
  if (!match) {
    return value;
  }
  const [year, month, day, hour, minute, second] = match
    .slice(1)
    .map((part) => Number(part ?? 0));
  const typed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    typed.getUTCFullYear() !== year ||
    typed.getUTCMonth() !== month - 1 ||
    typed.getUTCDate() !== day ||
    typed.getUTCHours() !== hour
  ) {
    return value;
  }
  const instant = zonedInstant(
    { year, month, day, hour, minute, second },
    timeZone,
  );
  const wall = wallClock(instant, timeZone);
  const offset = isoOffset(zoneOffsetMinutes(instant, timeZone));
  return `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}${offset}`;
}

// "3/10" with a limit, and just "3" without one.
export function seatsText(taken: number, capacity: number | null): string {
  return capacity === null ? String(taken) : `${taken}/${capacity}`;
}

// An empty input means null. Anything else goes to the backend, which rejects bad numbers.
// Only a plain number becomes a number. Anything else, such as "1e3" or "5 cho", is sent
// as typed, so the backend refuses it with a clear error instead of reading it wrongly.
export function numberOrNull(value: string): number | string | null {
  if (!value) {
    return null;
  }
  return /^-?[0-9]+(\.[0-9]+)?$/.test(value) ? Number(value) : value;
}
