// Permission codes the backend allows inside a custom org role; the
// catalog itself arrives on the role list response, these are labels.
export const PERMISSION_LABELS: Record<string, string> = {
  "member:view": "Xem danh sách thành viên",
  "member:invite": "Mời thành viên",
  "member:suspend": "Tạm khóa / kích hoạt thành viên",
  "member:remove": "Xóa thành viên",
  "member:role-assign": "Gán vai trò cho thành viên",
  "org:update": "Sửa hồ sơ và chính sách tổ chức",
  "media:manage": "Quản lý thư viện tệp",
  "activity:view": "Xem sự kiện nội bộ",
  "activity:create": "Tạo sự kiện",
  "activity:manage": "Quản lý sự kiện",
  "activity:delete": "Xóa và khôi phục sự kiện",
  "tag:manage": "Quản lý thẻ",
  "post:create": "Viết bài và thảo luận",
  "post:publish": "Đăng bài lên bảng tin",
  "post:edit-any": "Sửa bài của người khác",
  "post:delete-any": "Xóa và khôi phục bài của người khác",
  "post:announce": "Đăng thông báo của tổ chức",
  "post:manage": "Ghim bài (gồm sửa, xóa bài và bình luận của người khác)",
  "comment:create": "Bình luận bài viết",
  "comment:delete-any": "Xóa bình luận của người khác",
  "chat:manage": "Toàn quyền chat (gồm mọi quyền chat bên dưới)",
  "chat:timeout": "Tạm cấm chat thành viên",
  "chat:mention-all": "Nhắc cả nhóm bằng @all",
  "chat:attach": "Đính kèm tệp khi tổ chức hạn chế tệp",
  "chat:moderate": "Ghim và xóa tin nhắn của người khác",
  "chat:channel": "Quản lý kênh và thành viên kênh",
  "chat:view-private": "Xem kênh hạn chế mà không cần được thêm",
};

// Grouped labels keep the role editor readable; order is display order.
export const PERMISSION_GROUPS: { label: string; codes: string[] }[] = [
  {
    label: "Thành viên",
    codes: [
      "member:view",
      "member:invite",
      "member:suspend",
      "member:remove",
      "member:role-assign",
    ],
  },
  { label: "Tổ chức", codes: ["org:update", "media:manage"] },
  {
    label: "Sự kiện",
    codes: [
      "activity:view",
      "activity:create",
      "activity:manage",
      "activity:delete",
      "tag:manage",
    ],
  },
  {
    label: "Bài viết",
    codes: [
      "post:create",
      "post:publish",
      "post:announce",
      "post:edit-any",
      "post:delete-any",
      "post:manage",
    ],
  },
  { label: "Bình luận", codes: ["comment:create", "comment:delete-any"] },
  {
    label: "Trò chuyện",
    codes: [
      "chat:moderate",
      "chat:timeout",
      "chat:channel",
      "chat:view-private",
      "chat:mention-all",
      "chat:attach",
      "chat:manage",
    ],
  },
];
