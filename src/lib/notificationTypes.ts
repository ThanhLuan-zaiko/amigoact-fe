// The notification codes the backend sends, with the Vietnamese name of each one for the
// preferences page. Keep the list in step with amigoact-be/docs/notifications.md.

export const NOTIFICATION_TYPE_LABELS = {
  registration_approved: "Đăng ký hoạt động được duyệt",
  registration_rejected: "Đăng ký hoạt động không được duyệt",
  registration_promoted: "Được chuyển từ danh sách chờ lên",
  activity_cancelled: "Hoạt động bị hủy",
  membership_requested: "Có người xin vào tổ chức của bạn",
  membership_approved: "Yêu cầu vào tổ chức được duyệt",
  membership_rejected: "Yêu cầu vào tổ chức không được duyệt",
  member_left: "Thành viên rời tổ chức",
  membership_removed: "Bị xóa khỏi tổ chức",
  hours_awarded: "Được ghi giờ tình nguyện",
  appeal_approved: "Khiếu nại điểm danh được chấp nhận",
  appeal_rejected: "Khiếu nại điểm danh bị từ chối",
  certificate_issued: "Chứng nhận được cấp",
  certificate_revoked: "Chứng nhận bị thu hồi",
} as const;

export type NotificationType = keyof typeof NOTIFICATION_TYPE_LABELS;

export const NOTIFICATION_TYPES = Object.keys(
  NOTIFICATION_TYPE_LABELS,
) as NotificationType[];

// The realtime frames that change the notification list, so a page reloads its list.
export const NOTIFICATION_EVENTS = [
  "notification.created",
  "notification.deleted",
  "notification.read",
  "notification.read_all",
];

export type NotificationPreferences = {
  inapp: boolean;
  email: boolean;
  muted_types: string[];
};

// The preferences form lists what a person receives. Everything else is muted.
export function mutedTypesFrom(
  received: readonly string[],
): NotificationType[] {
  return NOTIFICATION_TYPES.filter((type) => !received.includes(type));
}

export function isNotificationType(value: string): value is NotificationType {
  return Object.hasOwn(NOTIFICATION_TYPE_LABELS, value);
}
