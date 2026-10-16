// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
export const HOUR_SOURCE_LABELS: Record<string, string> = {
  attendance: "Điểm danh",
  manual: "Nhập tay",
  adjustment: "Điều chỉnh",
};

export const HOUR_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
};

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_HOURS_STATE: "Trạng thái giờ tình nguyện không hợp lệ.",
  NOT_FOUND: "Không tìm thấy dữ liệu.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
};

export function toVietnameseHourError(
  code: string,
  fallback?: string,
): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "Có lỗi xảy ra.";
}
