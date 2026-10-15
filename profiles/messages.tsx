import { ApiError } from "../core/api.ts";
import { pushToast } from "../core/toast.ts";

export const PROFILE_MESSAGES: Record<string, string> = {
  SKILL_NOT_FOUND: "Kỹ năng không tồn tại, hãy chọn lại từ danh sách.",
  INVALID_SKILL_LEVEL: "Mức kỹ năng phải từ 1 đến 5.",
  TOO_MANY_CONTACTS: "Bạn chỉ được thêm tối đa 3 liên hệ khẩn cấp.",
  PROFILE_NOT_FOUND: "Không tìm thấy hồ sơ tình nguyện viên.",
  NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  UNSUPPORTED_MEDIA: "Ảnh đại diện chỉ nhận tệp hình ảnh.",
  MEDIA_TOO_LARGE: "Tệp vượt quá dung lượng cho phép.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Yêu cầu thất bại, vui lòng thử lại.",
  VALIDATION_ERROR: "Dữ liệu chưa hợp lệ, hãy kiểm tra lại các ô.",
  STUDENT_CODE_REQUIRED: "Vui lòng nhập mã sinh viên.",
  CLASS_NAME_REQUIRED: "Vui lòng nhập lớp.",
  SCHOOL_NAME_REQUIRED: "Vui lòng nhập tên trường.",
  YEAR_RANGE: "Năm nhập học phải nằm trong 1950–2100.",
  TOO_MANY_INTERESTS: "Tối đa 20 sở thích.",
  PROFILE_EMPTY: "Hồ sơ cần ít nhất một thông tin ngoài trạng thái.",
  CONTACT_NAME_REQUIRED: "Vui lòng nhập họ tên người liên hệ.",
  CONTACT_PHONE_REQUIRED: "Vui lòng nhập số điện thoại liên hệ.",
  CONTACT_PHONE_LENGTH: "Số điện thoại cần từ 8 đến 20 ký tự.",
};

export const PROFILE_TOAST = {
  saved: "Đã lưu hồ sơ.",
  blocked: "Chưa lưu được hồ sơ.",
  skillsSaved: "Đã lưu kỹ năng.",
  contactAdded: "Đã thêm liên hệ khẩn cấp.",
  contactBlocked: "Chưa thêm được liên hệ.",
  contactRemoved: "Đã xoá liên hệ.",
  avatarSaved: "Đã cập nhật ảnh đại diện.",
} as const;

export function profileMessage(code: string): string {
  return PROFILE_MESSAGES[code] ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
}

export function fieldText(
  errors: Record<string, string>,
  key: string,
): string | undefined {
  const code = errors[key];
  return code ? profileMessage(code) : undefined;
}

export function toastKnownError(code: string): string {
  const text = profileMessage(code);
  pushToast({ tone: "error", title: text });
  return text;
}

export function toastProfileError(err: unknown): string {
  const code =
    err instanceof ApiError
      ? err.status === 422
        ? "VALIDATION_ERROR"
        : err.code
      : "REQUEST_FAILED";
  return toastKnownError(code);
}

export function toastProfileBlocked(title: string, codes: string[]): void {
  const message = [...new Set(codes)].map(profileMessage).join(" ");
  pushToast({ tone: "error", title, message });
}

export function toastProfileOk(title: string): void {
  pushToast({ tone: "success", title });
}

const STATUS_LABELS: Record<string, string> = {
  studying: "Đang học",
  graduated: "Đã tốt nghiệp",
  suspended: "Tạm ngưng",
  working: "Đang đi làm",
};

export function profileStatusLabel(status: string | null): string {
  return STATUS_LABELS[status ?? ""] ?? "Chưa cập nhật";
}

export const LEVEL_LABELS: Record<number, string> = {
  1: "Mới bắt đầu",
  2: "Cơ bản",
  3: "Khá",
  4: "Thành thạo",
  5: "Chuyên gia",
};
