// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy nội dung yêu cầu.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
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
      return `${actor} vừa chuyển một bài viết về nháp.`;
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
