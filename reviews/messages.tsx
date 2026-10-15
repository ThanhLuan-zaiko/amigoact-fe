// Vietnamese UI copy for reviews (ASCII-safe module rule).
const ERROR_MESSAGES: Record<string, string> = {
  REVIEW_EXISTS: "Bạn đã đánh giá hoạt động này rồi.",
  INVALID_REGISTRATION_STATE:
    "Chỉ tình nguyện viên đã điểm danh mới được đánh giá.",
  NOT_FOUND: "Không tìm thấy hoạt động.",
  SERVER_OVERLOADED: "Máy chủ đang quá tải. Vui lòng thử lại sau giây lát.",
};

export function toVietnameseReviewError(
  code: string,
  fallback?: string,
): string {
  return ERROR_MESSAGES[code] ?? fallback ?? "Có lỗi xảy ra.";
}
