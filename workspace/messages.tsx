// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy nội dung yêu cầu.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
  REQUIRED: "Trường này là bắt buộc.",
  MEMBER_NOT_FOUND: "Thành viên không còn trong tổ chức.",
  INVALID_MEMBER_STATE: "Không thể thực hiện với trạng thái thành viên hiện tại.",
  POST_PUBLISHED: "Đã đăng bài.",
  POST_UPDATED: "Đã cập nhật bài viết.",
  POST_DELETED: "Đã xóa bài viết.",
  POST_PINNED: "Đã ghim bài viết.",
  POST_UNPINNED: "Đã bỏ ghim bài viết.",
  INVALID_POST_STATE: "Bài viết không ở trạng thái phù hợp cho thao tác này.",
  POST_CONTENT_REQUIRED: "Bài viết cần có nội dung trước khi tiếp tục.",
  POST_TITLE_REQUIRED: "Thông báo cần có tiêu đề.",
  UPLOAD_IN_PROGRESS: "Đang tải tệp lên, vui lòng chờ hoàn tất.",
  UNSUPPORTED_MEDIA:
    "Chỉ nhận ảnh (JPG, PNG, WebP, GIF, AVIF, BMP, TIFF, HEIC) và video (MP4, WebM, MOV).",
  MEDIA_TOO_LARGE: "Tệp vượt quá dung lượng cho phép.",
  COMMENT_POSTED: "Đã bình luận.",
  COMMENT_DELETED: "Đã xóa bình luận.",
  MESSAGE_DELETED: "Đã xóa tin nhắn.",
  CHAT_CONTENT_REQUIRED: "Tin nhắn cần có nội dung hoặc tệp đính kèm.",
};

export function toVietnameseWorkspaceMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}

export const POST_KIND_LABELS: Record<string, string> = {
  announcement: "Thông báo",
  discussion: "Thảo luận",
};

export const POST_STATUS_LABELS: Record<string, string> = {
  published: "Đã đăng",
  draft: "Nháp",
};

export const POST_VISIBILITY_LABELS: Record<string, string> = {
  public: "Công khai",
  members: "Chỉ thành viên",
};

// Row badge for shelves/detail: a draft that stages edits for a live post
// (pending revision) and a post pulled back off the board (unpublished)
// both read differently from a fresh draft.
export function postStatusLabel(post: {
  status: string;
  published_at: string | null;
  revision_of: string | null;
}): string {
  if (post.status !== "draft") return POST_STATUS_LABELS[post.status] ?? "";
  if (post.revision_of !== null) return "Nháp chờ đăng";
  if (post.published_at !== null) return "Đã gỡ xuống";
  return POST_STATUS_LABELS.draft;
}

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  paragraph: "Đoạn văn",
  heading: "Tiêu đề phụ",
  quote: "Trích dẫn",
  list: "Danh sách",
  image: "Ảnh",
  video: "Video",
  divider: "Đường kẻ ngang",
};

// Toast copy for board events pushed on posts:{orgId} by other actors.
// Returns null for actions with no toast (still invalidate queries).
export function postEventToast(
  action: string,
  actorName: string | null,
): string | null {
  const actor = actorName ?? "Một thành viên";
  switch (action) {
    case "post.created":
      return `${actor} vừa đăng bài mới.`;
    case "post.updated":
      return `${actor} vừa chỉnh sửa bài viết.`;
    case "post.deleted":
      return `${actor} vừa xóa một bài viết.`;
    case "post.pinned":
      return `${actor} vừa ghim một bài viết.`;
    case "post.unpinned":
      return `${actor} vừa bỏ ghim một bài viết.`;
    case "post.unpublished":
      return `${actor} vừa gỡ một bài viết khỏi bảng tin.`;
    case "post.restored":
      return `${actor} vừa khôi phục một bài viết.`;
    case "post.purged":
      return `${actor} vừa xóa vĩnh viễn một bài viết.`;
    default:
      return null;
  }
}

export function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayStamp(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

// Telegram-style timestamp: clock time today, weekday inside the last
// week, short date older than that.
export function formatInboxTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const today = dayStamp(now);
  const that = dayStamp(date);
  if (that === today) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const dayMs = 86_400_000;
  if (that > today - 6 * dayMs) {
    return date.toLocaleDateString("vi-VN", { weekday: "short" });
  }
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

// HH:MM stamp inside a bubble - the day is carried by separators.
export function formatClock(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Day separator label: "Hom nay"/"Hom qua" inside the chat flow.
export function formatDayLabel(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diff = dayStamp(new Date()) - dayStamp(date);
  if (diff === 0) return "Hôm nay";
  if (diff === 86_400_000) return "Hôm qua";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function readingTimeLabel(minutes: number): string {
  return `${minutes} phút đọc`;
}

export function formatDay(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// dm subtitle fallback when the peer holds no live socket.
export function formatLastSeen(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const minutes = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "Hoạt động vừa xong";
  if (minutes < 60) return `Hoạt động ${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hoạt động ${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hoạt động ${days} ngày trước`;
  return `Hoạt động ${formatDay(iso)}`;
}
