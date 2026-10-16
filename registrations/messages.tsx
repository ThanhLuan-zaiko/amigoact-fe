// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
export const REGISTRATION_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  waitlisted: "Danh sách chờ",
  cancelled: "Đã hủy",
  attended: "Đã tham gia",
};

export const CHECKIN_METHOD_LABELS: Record<string, string> = {
  qr: "Quét QR",
  manual: "Thủ công",
};

const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_REGISTERED: "Bạn đã đăng ký hoạt động này rồi.",
  REGISTRATION_CLOSED:
    "Hoạt động này hiện không nhận đăng ký hoặc đã quá hạn.",
  ALREADY_CHECKED_IN: "Đăng ký này đã được điểm danh trước đó.",
  INVALID_REGISTRATION_STATE: "Trạng thái đăng ký không hợp lệ.",
  NOT_FOUND: "Không tìm thấy dữ liệu hoặc mã không hợp lệ.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
};

export function toVietnameseRegistrationError(
  code: string,
  fallback?: string,
): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "Có lỗi xảy ra.";
}
