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
