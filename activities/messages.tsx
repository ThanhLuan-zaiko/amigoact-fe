// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  draft: "Bản nháp",
  published: "Đã công bố",
  ongoing: "Đang diễn ra",
  completed: "Đã kết thúc",
  cancelled: "Đã hủy",
};

export const PARTNER_ROLE_LABELS: Record<string, string> = {
  co_organizer: "Đồng tổ chức",
  sponsor: "Nhà tài trợ",
};

export const STAFF_ROLE_LABELS: Record<string, string> = {
  organizer: "Điều phối",
  supervisor: "Giám sát",
  supporter: "Hỗ trợ",
};

const MESSAGES: Record<string, string> = {
  ACTIVITY_PUBLISHED: "Đã công bố hoạt động.",
  STATUS_UPDATED: "Đã cập nhật trạng thái.",
  ACTIVITY_DELETED:
    "Hoạt động đã bị xóa. Khôi phục từ thùng rác để chỉnh sửa.",
  FORBIDDEN: "Bạn không có quyền quản lý hoạt động này.",
  NOT_FOUND: "Không tìm thấy hoạt động.",
  REQUEST_FAILED: "Thao tác thất bại. Thử lại sau.",
};

export function toVietnameseActivityMessage(code: string): string {
  return MESSAGES[code] ?? "";
}

const TAG_MESSAGES: Record<string, string> = {
  TAG_EXISTS:
    'Tổ chức đã có thẻ này. Dùng "Gộp" nếu muốn hợp nhất hai thẻ.',
  TAG_NOT_FOUND:
    "Không tìm thấy thẻ. Có thể thẻ vừa được đổi tên hoặc xóa.",
  INVALID_TAG_MERGE: "Hãy chọn một thẻ khác để gộp.",
  FORBIDDEN:
    'Bạn cần quyền "Quản lý thẻ" để thực hiện thao tác này.',
  NOT_FOUND: "Không tìm thấy tổ chức.",
  TAG_DELETED:
    "Thẻ này đang ở thùng rác của tổ chức. Người có quyền \"Quản lý thẻ\" cần khôi phục thẻ trước khi dùng lại.",
  INVALID_ORG_STATE: "Thẻ không nằm trong thùng rác.",
  VALIDATION_ERROR:
    "Tên thẻ dài 1–40 ký tự và phải có chữ hoặc số.",
};

export function toVietnameseTagMessage(code: string): string {
  return TAG_MESSAGES[code] ?? "Thao tác thất bại. Thử lại sau.";
}
