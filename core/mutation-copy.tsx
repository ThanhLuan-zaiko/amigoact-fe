/**
 * Central copy table for mutation toasts (AGENTS.md 4 + 12.5).
 *
 * `useMutation` declarations set `meta: { successToast: "<key>" }` inside
 * .ts hooks where Vietnamese literals are not allowed; the MutationCache in
 * core/queryClient.ts resolves the key through this table. Callers in .tsx
 * may still pass a literal Vietnamese title as the "key" - it resolves to
 * itself. Missing key => no toast, so declaring the meta IS the decision.
 */

export const MUTATION_TOAST_TITLES: Record<string, string> = {
  // auth
  "auth.register": "Đã tạo tài khoản.",
  "auth.password": "Đã cập nhật mật khẩu.",
  "auth.resend": "Đã gửi lại mã xác minh.",
  "auth.profile": "Đã cập nhật hồ sơ.",
  "auth.sessionRevoked": "Đã đăng xuất thiết bị đó.",
  "apikey.revoked": "Đã thu hồi khóa API.",
  "report.snapshot": "Đã lưu báo cáo.",
  "admin.moderation": "Đã cập nhật kiểm duyệt.",
  // dashboard / orgs
  "org.create": "Đã tạo tổ chức.",
  "org.update": "Đã lưu thay đổi.",
  "org.join-policy": "Đã cập nhật chính sách tham gia.",
  "org.trash": "Đã chuyển vào thùng rác.",
  "org.erase": "Đã xóa vĩnh viễn.",
  "org.restore": "Đã khôi phục tổ chức.",
  "org.media.upload": "Đã tải ảnh lên.",
  "org.media.role": "Đã cập nhật vai trò ảnh.",
  "org.media.replace": "Đã thay ảnh.",
  "org.media.delete": "Đã xóa ảnh.",
  "org.media.wipe": "Đã xóa toàn bộ ảnh.",
  "org.join": "Đã tham gia tổ chức.",
  // members / roles
  "member.invite": "Đã gửi lời mời.",
  "member.remove": "Đã xóa thành viên.",
  "member.approve": "Đã duyệt thành viên.",
  "member.ban": "Đã chặn thành viên.",
  "member.unban": "Đã bỏ chặn thành viên.",
  "member.role": "Đã cập nhật vai trò.",
  "role.save": "Đã lưu vai trò.",
  "role.delete": "Đã xóa vai trò.",
  // activities / registrations / hours / certificates / reviews
  "tag.create": "Đã thêm thẻ.",
  "tag.rename": "Đã đổi tên thẻ.",
  "tag.merge": "Đã gộp thẻ.",
  "tag.trash": "Đã chuyển thẻ vào thùng rác.",
  "tag.restore": "Đã khôi phục thẻ.",
  "tag.erase": "Đã xóa vĩnh viễn thẻ.",
  "activity.save": "Đã lưu hoạt động.",
  "activity.thread": "Đã tạo sự kiện và mở luồng thông báo.",
  "activity.delete": "Đã xóa hoạt động.",
  "activity.category": "Đã tạo danh mục.",
  "activity.announce": "Đã đăng thông báo.",
  "registration.apply": "Đã gửi đăng ký.",
  "registration.save": "Đã cập nhật đăng ký.",
  "registration.cancel": "Đã hủy đăng ký.",
  "registration.checkin": "Đã điểm danh.",
  "registration.checkout": "Đã kết thúc điểm danh.",
  "hours.log": "Đã ghi giờ tình nguyện.",
  "hours.approve": "Đã duyệt giờ.",
  "certificate.issue": "Đã cấp chứng nhận.",
  "certificate.revoke": "Đã thu hồi chứng nhận.",
  "review.submit": "Đã gửi đánh giá.",
  "media.upload": "Đã tải media lên.",
  "media.delete": "Đã xóa media.",
  // workspace / posts / notifications / admin
  "post.save": "Đã lưu bài viết.",
  "post.publish": "Đã đăng bài viết.",
  "post.delete": "Đã xóa bài viết.",
  "post.unpublish": "Đã gỡ đăng bài viết.",
  "post.restore": "Đã khôi phục bài viết.",
  "post.pin": "Đã cập nhật ghim bài viết.",
  "notification.read-all": "Đã đánh dấu đã đọc.",
  "notification.prefs": "Đã lưu tùy chọn thông báo.",
  "admin.moderate": "Đã cập nhật kiểm duyệt.",
  "admin.verify": "Đã xác minh tổ chức.",
  "admin.reject": "Đã từ chối tổ chức.",
  "admin.grant": "Đã cấp quyền quản trị.",
  "admin.revoke": "Đã thu hồi quyền quản trị.",
};
