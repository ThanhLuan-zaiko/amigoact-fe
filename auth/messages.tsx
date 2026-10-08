// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
const MESSAGES: Record<string, string> = {
  REQUIRED: "Trường này là bắt buộc.",
  INVALID_EMAIL: "Email chưa đúng định dạng.",
  INVALID_PHONE:
    "Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).",
  WEAK_PASSWORD:
    "Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
  PASSWORD_MISMATCH: "Mật khẩu nhập lại chưa khớp.",
  SAME_AS_CURRENT: "Mật khẩu mới phải khác mật khẩu hiện tại.",
  INVALID_NAME: "Họ tên từ 2 đến 100 ký tự.",
  INVALID_CODE: "Mã xác nhận gồm 6 chữ số.",
  EMAIL_TAKEN: "Email này đã được đăng ký.",
  PHONE_TAKEN: "Số điện thoại này đã được sử dụng.",
  INVALID_TAX_CODE: "Mã số thuế 10 số (chi nhánh thêm -XXX).",
  INVALID_CCCD: "CCCD gồm 12 chữ số.",
  INVALID_COMPANY_NAME: "Tên công ty từ 2 đến 200 ký tự.",
  INVALID_LEGAL_REP: "Tên người đại diện từ 2 đến 100 ký tự.",
  INVALID_BUSINESS_PROFILE: "Hồ sơ doanh nghiệp còn thiếu thông tin bắt buộc.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu chưa đúng.",
  EMAIL_NOT_VERIFIED:
    "Tài khoản chưa xác minh email. Vui lòng nhập mã đã gửi tới hộp thư của bạn.",
  CODE_EXPIRED: "Mã đã hết hạn. Vui lòng yêu cầu mã mới.",
  TOO_MANY_REQUESTS: "Bạn thao tác quá nhiều. Vui lòng thử lại sau ít phút.",
  NOT_FOUND: "Không tìm thấy thông tin yêu cầu.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  ACCOUNT_SUSPENDED: "Tài khoản đang bị tạm khóa.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
};

export function toVietnameseMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}
