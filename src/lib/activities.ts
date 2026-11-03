// Shapes of the activity API responses, with their labels and time helpers.

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

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

const dateTimeFormat = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatDateTime(value: string | null): string {
  return value ? dateTimeFormat.format(new Date(value)) : "";
}

// A datetime-local input has no time zone, so the app always means Vietnam time.
export function toLocalInput(value: string | null): string {
  if (!value) {
    return "";
  }
  const shifted = new Date(new Date(value).getTime() + VIETNAM_OFFSET_MS);
  return shifted.toISOString().slice(0, 16);
}

export function fromLocalInput(value: string): string | null {
  return value ? `${value}:00+07:00` : null;
}

// "3/10" with a limit, and just "3" without one.
export function seatsText(taken: number, capacity: number | null): string {
  return capacity === null ? String(taken) : `${taken}/${capacity}`;
}

// An empty input means null. Anything else goes to the backend, which rejects bad numbers.
export function numberOrNull(value: string): number | string | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}
