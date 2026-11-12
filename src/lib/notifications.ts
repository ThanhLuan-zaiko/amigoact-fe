// The notification bell: Vietnamese text for each backend code, socket frames, and the local
// state they change. Pure, so bun tests cover them. See docs/notifications.md.

export type NotificationItem = {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

export type NotificationPage = {
  items: NotificationItem[];
  next_offset: number | null;
  unread_count: number;
};

export type NotificationFrame =
  | { kind: "created"; item: NotificationItem }
  // The thing it pointed at is gone, for example a withdrawn membership request.
  | { kind: "deleted"; item: NotificationItem }
  | { kind: "read"; id: string }
  | { kind: "read_all" };

export type BellState = {
  // Null until the panel is opened for the first time.
  items: NotificationItem[] | null;
  unread: number;
};

export type NotificationView = {
  text: string;
  // The reason someone gave, shown under the text.
  detail: string | null;
  href: string | null;
};

type Raw = Record<string, unknown>;

function field(data: Raw, key: string): string {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : "";
}

function quoted(data: Raw): string {
  const title = field(data, "activity_title");
  return title ? `"${title}"` : "một hoạt động";
}

function orgPath(data: Raw, rest = ""): string | null {
  const slug = field(data, "organization_slug");
  return slug ? `/org/${encodeURIComponent(slug)}${rest}` : null;
}

function activityPath(data: Raw): string | null {
  const id = field(data, "activity_id");
  return id ? `/activities/${encodeURIComponent(id)}` : null;
}

function hoursText(data: Raw): string {
  const hours = data.hours;
  return typeof hours === "number" && Number.isFinite(hours)
    ? `${hours.toLocaleString("vi-VN")} giờ`
    : "giờ tình nguyện";
}

// Unknown codes still show a line, so a newer backend cannot break the bell.
export function describeNotification(item: NotificationItem): NotificationView {
  const data = item.data;
  const org = field(data, "organization_name") || "tổ chức";
  const activity = quoted(data);
  const note = field(data, "note") || null;
  switch (item.type) {
    case "membership_requested":
      return {
        text: `${field(data, "applicant_name") || "Một người"} xin vào ${org}`,
        detail: field(data, "message") || null,
        href: orgPath(data, "/applications"),
      };
    case "membership_approved":
      return {
        text: `Bạn đã được nhận vào ${org}`,
        detail: null,
        href: orgPath(data),
      };
    case "membership_rejected":
      return {
        text: `Yêu cầu vào ${org} không được duyệt`,
        detail: null,
        href: orgPath(data),
      };
    case "member_left":
      return {
        text: `${field(data, "member_name") || "Một thành viên"} đã rời ${org}`,
        detail: null,
        href: orgPath(data, "/members"),
      };
    case "membership_removed":
      return {
        text: `Bạn đã bị xóa khỏi ${org}`,
        detail: null,
        href: orgPath(data),
      };
    case "registration_approved":
      return {
        text: `Đăng ký ${activity} đã được duyệt`,
        detail: note,
        href: activityPath(data),
      };
    case "registration_rejected":
      return {
        text: `Đăng ký ${activity} không được duyệt`,
        detail: note,
        href: activityPath(data),
      };
    case "registration_promoted":
      return {
        text: `Bạn đã có chỗ trong ${activity}`,
        detail: null,
        href: activityPath(data),
      };
    case "activity_cancelled":
      return {
        text: `Hoạt động ${activity} đã bị hủy`,
        detail: null,
        href: activityPath(data),
      };
    case "hours_awarded":
      return {
        text: `Bạn được ghi ${hoursText(data)} cho ${activity}`,
        detail: null,
        href: "/hours",
      };
    case "appeal_approved":
      return {
        text: `Khiếu nại điểm danh ${activity} được chấp nhận`,
        detail: null,
        href: activityPath(data),
      };
    case "appeal_rejected":
      return {
        text: `Khiếu nại điểm danh ${activity} bị từ chối`,
        detail: null,
        href: activityPath(data),
      };
    case "certificate_issued":
      return {
        text: `Bạn nhận được chứng nhận cho ${activity}`,
        detail: null,
        href: "/certificates",
      };
    case "certificate_revoked":
      return {
        text: `Chứng nhận cho ${activity} đã bị thu hồi`,
        detail: field(data, "reason") || null,
        href: "/certificates",
      };
    default:
      return { text: "Bạn có thông báo mới", detail: null, href: null };
  }
}

function isItem(value: unknown): value is NotificationItem {
  if (!value || typeof value !== "object") {
    return false;
  }
  const item = value as Raw;
  return (
    typeof item.id === "string" &&
    typeof item.type === "string" &&
    !!item.data &&
    typeof item.data === "object" &&
    typeof item.read === "boolean" &&
    typeof item.created_at === "string"
  );
}

// The chat socket carries these frames too. Anything else gives null and is ignored.
export function parseNotificationFrame(text: string): NotificationFrame | null {
  try {
    return readNotificationFrame(JSON.parse(text));
  } catch {
    return null;
  }
}

// The same, for a frame the realtime client already parsed.
export function readNotificationFrame(data: unknown): NotificationFrame | null {
  if (!data || typeof data !== "object") {
    return null;
  }
  const frame = data as Raw;
  if (frame.type === "notification.created" && isItem(frame.notification)) {
    return { kind: "created", item: frame.notification };
  }
  if (frame.type === "notification.deleted" && isItem(frame.notification)) {
    return { kind: "deleted", item: frame.notification };
  }
  if (frame.type === "notification.read" && typeof frame.id === "string") {
    return { kind: "read", id: frame.id };
  }
  if (frame.type === "notification.read_all") {
    return { kind: "read_all" };
  }
  return null;
}

export function applyNotificationFrame(
  state: BellState,
  frame: NotificationFrame,
): BellState {
  const items = state.items;
  if (frame.kind === "created") {
    // A frame that arrives twice, for example after a reconnect and a reload, counts once.
    if (items?.some((item) => item.id === frame.item.id)) {
      return state;
    }
    return {
      items: items ? [frame.item, ...items] : null,
      unread: state.unread + (frame.item.read ? 0 : 1),
    };
  }
  if (frame.kind === "deleted") {
    const known = items?.find((item) => item.id === frame.item.id);
    // An open list knows best whether it was read; otherwise the backend says.
    const wasUnread = known ? !known.read : !frame.item.read;
    if (items && !known && !wasUnread) {
      return state;
    }
    return {
      items: items?.filter((item) => item.id !== frame.item.id) ?? null,
      unread: Math.max(0, state.unread - (wasUnread ? 1 : 0)),
    };
  }
  if (frame.kind === "read_all") {
    return {
      items: items?.map((item) => ({ ...item, read: true })) ?? null,
      unread: 0,
    };
  }
  const target = items?.find((item) => item.id === frame.id);
  if (target?.read) {
    return state;
  }
  return {
    items:
      items?.map((item) =>
        item.id === frame.id ? { ...item, read: true } : item,
      ) ?? null,
    unread: Math.max(0, state.unread - 1),
  };
}

const dateFormat = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

// "Vừa xong", "5 phút trước", "3 giờ trước", "2 ngày trước", then the date.
export function timeAgo(iso: string, now: number = Date.now()): string {
  const time = Date.parse(iso);
  if (Number.isNaN(time)) {
    return "";
  }
  const minutes = Math.floor((now - time) / 60_000);
  if (minutes < 1) {
    return "Vừa xong";
  }
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} giờ trước`;
  }
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days} ngày trước` : dateFormat.format(time);
}
