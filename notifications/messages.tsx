import type { ReactElement } from "react";
import {
  FiBell,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiStar,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

export const NOTIFICATION_MESSAGES: Record<string, string> = {
  NOT_FOUND: "Không tìm thấy thông báo.",
  FORBIDDEN: "Bạn không có quyền với thông báo này.",
  UNAUTHORIZED: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Yêu cầu thất bại, vui lòng thử lại.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
};

export function notificationMessage(code: string): string {
  return NOTIFICATION_MESSAGES[code] ?? "Đã có lỗi xảy ra, vui lòng thử lại.";
}

const TYPE_LABELS: Record<string, string> = {
  membership: "Thành viên",
  organization: "Tổ chức",
  registration: "Đăng ký",
  attendance: "Điểm danh",
  staff: "Phân công",
  review: "Đánh giá",
  hours: "Giờ tình nguyện",
  certificate: "Chứng nhận",
  announcement: "Thông báo",
  system: "Hệ thống",
};

export function notificationTypeLabel(type: string): string {
  return TYPE_LABELS[type] ?? type;
}

const TYPE_ICONS: Record<string, (className: string) => ReactElement> = {
  membership: (c) => <FiUsers className={c} aria-hidden="true" />,
  organization: (c) => <FiBriefcase className={c} aria-hidden="true" />,
  registration: (c) => <FiCheckCircle className={c} aria-hidden="true" />,
  attendance: (c) => <FiCheckCircle className={c} aria-hidden="true" />,
  staff: (c) => <FiUserCheck className={c} aria-hidden="true" />,
  review: (c) => <FiStar className={c} aria-hidden="true" />,
  hours: (c) => <FiClock className={c} aria-hidden="true" />,
  certificate: (c) => <FiCheckCircle className={c} aria-hidden="true" />,
  announcement: (c) => <FiBell className={c} aria-hidden="true" />,
  system: (c) => <FiInfo className={c} aria-hidden="true" />,
};

export function notificationTypeIcon(
  type: string,
  className: string,
): ReactElement {
  const render = TYPE_ICONS[type] ?? TYPE_ICONS.system;
  return render(className);
}
