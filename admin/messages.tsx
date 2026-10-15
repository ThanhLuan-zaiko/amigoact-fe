export const ADMIN_MESSAGES: Record<string, string> = {
  FORBIDDEN: "Bạn không có quyền quản trị nền tảng.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  NOT_FOUND: "Không tìm thấy tổ chức.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản với email này.",
  INVALID_ORG_STATE: "Tổ chức không ở trạng thái chờ xác minh.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Yêu cầu thất bại, vui lòng thử lại.",
};

export function adminMessage(code: string): string {
  return ADMIN_MESSAGES[code] ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
}

export const LEGAL_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác minh",
  verified: "Đã xác minh",
  rejected: "Bị từ chối",
  none: "Không cần",
};

export function legalStatusLabel(status: string): string {
  return LEGAL_STATUS_LABELS[status] ?? status;
}

export const ORG_KIND_LABELS: Record<string, string> = {
  organization: "Tổ chức",
  club: "Câu lạc bộ",
  group: "Hội nhóm",
  business: "Doanh nghiệp",
};

export function orgKindLabel(kind: string): string {
  return ORG_KIND_LABELS[kind] ?? kind;
}
