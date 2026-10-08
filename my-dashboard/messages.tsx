// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
const MESSAGES: Record<string, string> = {
  REQUIRED: "Trường này là bắt buộc.",
  INVALID_NAME: "Tên từ 2 đến 100 ký tự.",
  INVALID_SLUG: "Slug 2-60 ký tự, chữ thường, số và dấu gạch ngang.",
  INVALID_DESCRIPTION: "Mô tả tối đa 500 ký tự.",
  SLUG_TAKEN: "Slug này đã được sử dụng.",
  NAME_TAKEN: "Tên tổ chức đã tồn tại.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy thông tin yêu cầu.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
};

export const ORG_KIND_LABELS: Record<string, string> = {
  organization: "Tổ chức",
  club: "Câu lạc bộ",
  group: "Hội nhóm",
  business: "Doanh nghiệp",
};

export function toVietnameseDashboardMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}
