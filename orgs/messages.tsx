// Vietnamese UI copy lives in this .tsx module (never in .ts) so the
// ASCII-only code gate keeps passing. Code and comments stay English.
export const ORG_KIND_LABELS: Record<string, string> = {
  organization: "Tổ chức",
  club: "Câu lạc bộ",
  group: "Hội nhóm",
  business: "Doanh nghiệp",
};

export const JOIN_POLICY_LABELS: Record<string, string> = {
  open: "Mở tham gia",
  invite: "Theo lời mời",
  review: "Nộp hồ sơ duyệt",
};

export const LEGAL_STATUS_LABELS: Record<string, string> = {
  none: "Chưa đăng ký pháp lý",
  pending: "Đang chờ xác minh",
  verified: "Đã xác minh pháp lý",
  rejected: "Pháp lý bị từ chối",
};

export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  published: "Sắp diễn ra",
  ongoing: "Đang diễn ra",
  completed: "Đã kết thúc",
};

export const TRUST_CHECK_LABELS: Record<string, string> = {
  platform_verified: "Được AmigoACT xác minh",
  legal: "Hồ sơ pháp lý",
  activities: "Đã tổ chức hoạt động",
  contact: "Công khai thông tin liên hệ",
  address: "Công khai địa chỉ",
  gallery: "Có hình ảnh hoạt động thực tế",
};

export const TRUST_CHECK_NOTES: Record<string, string> = {
  legal_none: "Chưa đăng ký pháp lý trên nền tảng",
  legal_pending: "Hồ sơ đang chờ đội ngũ duyệt",
  legal_rejected: "Hồ sơ pháp lý đã bị từ chối",
  activities_zero: "Chưa có hoạt động công khai nào",
  contact_missing: "Chưa công khai kênh liên hệ nào",
};

const MESSAGES: Record<string, string> = {
  NOT_FOUND: "Không tìm thấy tổ chức này.",
  ALREADY_MEMBER: "Bạn đã là thành viên của tổ chức này.",
  INVITE_ONLY: "Tổ chức này chỉ nhận thành viên qua lời mời.",
  ALREADY_APPLIED: "Bạn đã nộp hồ sơ và đang chờ tổ chức duyệt.",
  INVITE_PENDING: "Bạn đang có lời mời tham gia. Hãy phản hồi lời mời trước.",
  NOT_ACCEPTING_APPLICATIONS: "Tổ chức này không nhận hồ sơ tình nguyện.",
  APPLICATION_REQUIRED: "Tổ chức này duyệt hồ sơ. Hãy nộp hồ sơ tình nguyện.",
  ANSWER_REQUIRED: "Vui lòng trả lời các câu hỏi bắt buộc.",
  APPLICATION_COOLDOWN: "Hồ sơ trước đó của bạn vừa bị từ chối. Vui lòng chờ 7 ngày rồi nộp lại.",
  TOO_MANY_REQUESTS: "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau ít phút.",
  UNAUTHORIZED: "Vui lòng đăng nhập để tham gia.",
  ORG_DELETED: "Tổ chức này không còn hoạt động.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
  VALIDATION_ERROR: "Dữ liệu gửi lên chưa hợp lệ.",
  UNSUPPORTED_MEDIA: "Chỉ nhận file PDF hoặc ảnh.",
  MEDIA_TOO_LARGE: "File vượt quá 10 MB. Vui lòng chọn file nhỏ hơn.",
};

export function toVietnameseOrgsMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}
