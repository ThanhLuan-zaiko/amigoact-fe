// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
const MESSAGES: Record<string, string> = {
  REQUIRED: "Trường này là bắt buộc.",
  INVALID_NAME: "Tên từ 2 đến 100 ký tự.",
  INVALID_SLUG: "Slug 2-60 ký tự, chữ thường, số và dấu gạch ngang.",
  INVALID_DESCRIPTION: "Mô tả tối đa 500 ký tự.",
  SLUG_TAKEN: "Slug này đã được sử dụng.",
  NAME_TAKEN: "Tên tổ chức đã tồn tại.",
  TAX_CODE_TAKEN: "Mã số thuế này đã được đăng ký bởi tổ chức khác.",
  INVALID_TAX_CODE: "Mã số thuế 10 số (chi nhánh thêm -XXX).",
  INVALID_CONTACT_EMAIL: "Email liên hệ chưa đúng định dạng.",
  INVALID_ORG_PHONE: "Điện thoại liên hệ 5-20 ký tự (số, +, -, ngoặc).",
  INVALID_WEBSITE: "Website chưa đúng (ví dụ: https://example.org).",
  INVALID_CONTACT_FIELD: "Thông tin liên hệ vượt quá độ dài cho phép.",
  INVALID_CCCD: "CCCD gồm 12 chữ số.",
  INVALID_LEGAL_REP: "Tên người đại diện từ 2 đến 100 ký tự.",
  INVALID_LEGAL_REP_POSITION: "Chức danh từ 2 đến 100 ký tự.",
  INVALID_BUSINESS_PROFILE: "Hồ sơ doanh nghiệp còn thiếu MST và người đại diện.",
  ORG_UPDATED: "Đã lưu thay đổi.",
  ORG_TRASHED: "Đã chuyển vào thùng rác. Có thể khôi phục.",
  ORG_RESTORED: "Đã khôi phục tổ chức.",
  ORG_ERASED: "Đã xóa vĩnh viễn tổ chức và toàn bộ tệp.",
  ORG_DELETED: "Tổ chức đã bị xóa mềm.",
  UNSUPPORTED_MEDIA: "Chỉ nhận ảnh (JPG, PNG, WebP, GIF, AVIF, BMP, TIFF, HEIC) và video (MP4, WebM, MOV).",
  MEDIA_TOO_LARGE: "Tệp vượt quá dung lượng cho phép.",
  INVALID_MEDIA_ROLE: "Ảnh bìa và logo chỉ nhận tệp ảnh, và chỉ chủ tổ chức mới đặt được.",
  DROP_HINT: "Kéo thả ảnh/video vào đây, hoặc bấm để chọn.",
  DROP_HINT_STAGE: "Ảnh ≤10MB · Video ≤100MB · Có thể chọn vai trò và cắt ảnh trước khi tải lên.",
  UPLOAD_PARTIAL: "Tổ chức đã tạo, nhưng còn tệp chưa tải xong. Mở mục Tệp ở trang Tổ chức để thử lại.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  NOT_FOUND: "Không tìm thấy thông tin yêu cầu.",
  USER_NOT_FOUND: "Không tìm thấy tài khoản với email này.",
  ALREADY_MEMBER: "Người này đã là thành viên của tổ chức.",
  ALREADY_INVITED: "Người này đã có lời mời đang chờ.",
  MEMBER_NOT_FOUND: "Không tìm thấy thành viên này.",
  OWNER_IMMUTABLE: "Chủ sở hữu không thể rời hoặc bị thay đổi quyền.",
  INVALID_MEMBER_STATE: "Trạng thái thành viên không hợp lệ cho thao tác này.",
  INVALID_ROLE: "Vai trò không hợp lệ hoặc quyền hạn không được hỗ trợ.",
  ROLE_NAME_TAKEN: "Tên vai trò này đã được sử dụng.",
  ROLE_NOT_FOUND: "Không tìm thấy vai trò này.",
  ROLE_ABOVE_YOU: "Vai trò này ngang hoặc cao hơn vai trò cao nhất của bạn nên bạn không thể thay đổi.",
  INVITE_ONLY: "Tổ chức này chỉ nhận thành viên qua lời mời.",
  INVALID_EMAIL: "Địa chỉ email không hợp lệ.",
  INVITE_SENT: "Đã gửi lời mời.",
  INVITE_ACCEPTED: "Đã tham gia tổ chức.",
  INVITE_DECLINED: "Đã từ chối lời mời.",
  MEMBER_UPDATED: "Đã cập nhật thành viên.",
  MEMBER_REMOVED: "Đã xóa thành viên.",
  MEMBER_LEFT: "Bạn đã rời tổ chức.",
  JOINED_ORG: "Bạn đã gia nhập tổ chức.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
};

export const ORG_KIND_LABELS: Record<string, string> = {
  organization: "Tổ chức",
  club: "Câu lạc bộ",
  group: "Hội nhóm",
  business: "Doanh nghiệp",
};

export const MEDIA_ROLE_LABELS: Record<string, string> = {
  gallery: "Thường",
  cover: "Ảnh bìa",
  logo: "Logo",
};

export const ORG_STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  pending: "Chờ duyệt",
  suspended: "Tạm khóa",
};

export const JOIN_POLICY_LABELS: Record<string, string> = {
  invite: "Chỉ mời",
  open: "Mở",
};

export function toVietnameseDashboardMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}
