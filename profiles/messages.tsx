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
  REQUEST_FAILED: "Yêu cầu thất bại, vui lòng thử lại.",
};

export function profileMessage(code: string): string {
  return PROFILE_MESSAGES[code] ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
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
