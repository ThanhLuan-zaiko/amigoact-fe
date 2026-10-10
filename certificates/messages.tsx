// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
export const CERTIFICATE_STATUS_LABELS: Record<string, string> = {
  issued: "Đã cấp",
  revoked: "Đã thu hồi",
};

const ERROR_MESSAGES: Record<string, string> = {
  CERTIFICATE_EXISTS: "Chứng nhận đã được cấp cho sinh viên này.",
  INVALID_REGISTRATION_STATE:
    "Chỉ cấp chứng nhận cho đăng ký đã điểm danh.",
  NOT_FOUND: "Không tìm thấy chứng nhận hoặc mã không hợp lệ.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
};

export function toVietnameseCertificateError(
  code: string,
  fallback?: string,
): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "Có lỗi xảy ra.";
}
