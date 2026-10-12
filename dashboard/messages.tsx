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
  INVITE_ONLY: "Tổ chức này chỉ nhận thành viên qua lời mời.",
  INVALID_EMAIL: "Địa chỉ email không hợp lệ.",
  INVITE_SENT: "Đã gửi lời mời.",
  INVITE_ACCEPTED: "Đã tham gia tổ chức.",
  INVITE_DECLINED: "Đã từ chối lời mời.",
  MEMBER_UPDATED: "Đã cập nhật thành viên.",
  MEMBER_REMOVED: "Đã xóa thành viên.",
  MEMBER_LEFT: "Bạn đã rời tổ chức.",
  JOINED_ORG: "Bạn đã gia nhập tổ chức.",
  REQUEST_FAILED: "Có lỗi xảy ra. Vui lòng thử lại sau.",
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

export const MEMBER_ROLE_LABELS: Record<string, string> = {
  owner: "Chủ sở hữu",
  admin: "Quản trị viên",
  member: "Thành viên",
};

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
    codes: ["activity:view", "activity:create", "activity:manage"],
  },
];

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  invited: "Đã mời",
  suspended: "Tạm khóa",
  left: "Đã rời",
};

export const JOIN_POLICY_LABELS: Record<string, string> = {
  invite: "Chỉ mời",
  open: "Mở",
};

export function toVietnameseDashboardMessage(code: string): string {
  return MESSAGES[code] ?? MESSAGES["REQUEST_FAILED"];
}

// Toast copy for member mutations the viewer just performed.
export function memberMutationToast(action: string, name: string | null): string {
  const member = name ?? "thành viên";
  switch (action) {
    case "promoted":
      return `Đã gán quyền quản trị viên cho ${member}.`;
    case "demoted":
      return `Đã hạ ${member} xuống thành viên.`;
    case "suspended":
      return `Đã tạm khóa ${member}.`;
    case "reactivated":
      return `Đã kích hoạt lại ${member}.`;
    case "removed":
      return `Đã xóa ${member} khỏi tổ chức.`;
    case "revoked":
      return `Đã thu hồi lời mời của ${member}.`;
    case "left":
      return "Bạn đã rời tổ chức.";
    case "roles":
      return `Đã cập nhật vai trò của ${member}.`;
    default:
      return MESSAGES["MEMBER_UPDATED"];
  }
}

// Toast copy for roster events pushed on members:{orgId} by other actors.
// Returns null for unknown actions so callers only invalidate the query.
// `detail` carries the custom role name on role_granted / role_revoked /
// role_catalog_changed events.
export function memberEventToast(
  action: string,
  targetName: string | null,
  actorName: string | null,
  detail: string | null = null,
): string | null {
  const target = targetName ?? "Một thành viên";
  const actor = actorName;
  const role = detail ?? "vai trò mới";
  switch (action) {
    case "role_granted":
      return actor
        ? `${actor} đã gán vai trò ${role} cho ${target}.`
        : `${target} đã được gán vai trò ${role}.`;
    case "role_revoked":
      return actor
        ? `${actor} đã thu vai trò ${role} của ${target}.`
        : `${target} đã bị thu vai trò ${role}.`;
    case "role_catalog_changed":
      return `Danh sách vai trò của tổ chức vừa được cập nhật (${role}).`;
    case "promoted":
      return actor
        ? `${actor} đã gán quyền quản trị viên cho ${target}.`
        : `${target} đã được gán quyền quản trị viên.`;
    case "demoted":
      return actor
        ? `${actor} đã hạ ${target} xuống thành viên.`
        : `${target} đã bị hạ xuống thành viên.`;
    case "suspended":
      return actor
        ? `${actor} đã tạm khóa ${target}.`
        : `${target} đã bị tạm khóa.`;
    case "reactivated":
      return actor
        ? `${actor} đã kích hoạt lại ${target}.`
        : `${target} đã được kích hoạt lại.`;
    case "removed":
      return actor
        ? `${actor} đã xóa ${target} khỏi tổ chức.`
        : `${target} đã bị xóa khỏi tổ chức.`;
    case "left":
      return `${target} đã rời tổ chức.`;
    case "invited":
      return actor
        ? `${actor} đã gửi lời mời cho ${target}.`
        : `Đã gửi lời mời cho ${target}.`;
    case "accepted":
      return `${target} đã chấp nhận lời mời tham gia.`;
    case "declined":
      return `${target} đã từ chối lời mời tham gia.`;
    case "joined":
      return `${target} vừa gia nhập tổ chức.`;
    default:
      return null;
  }
}

// Toast copy for membership events pushed on notifications:{userId} where
// the viewer is the target (invited, suspended, removed, role changes).
// Self-caused actions (accepted/declined/joined/left) return null.
export function membershipEventToast(
  action: string,
  orgName: string | null,
  detail: string | null = null,
): string | null {
  const org = orgName ?? "tổ chức";
  const role = detail ?? "vai trò mới";
  switch (action) {
    case "invited":
      return `Bạn có lời mời tham gia ${org}.`;
    case "promoted":
      return `Bạn đã được gán quyền quản trị viên tại ${org}.`;
    case "demoted":
      return `Bạn không còn là quản trị viên của ${org}.`;
    case "role_granted":
      return `Bạn đã được gán vai trò ${role} tại ${org}.`;
    case "role_revoked":
      return `Bạn không còn vai trò ${role} tại ${org}.`;
    case "suspended":
      return `Bạn đã bị tạm khóa khỏi ${org}.`;
    case "reactivated":
      return `Bạn đã được kích hoạt lại trong ${org}.`;
    case "removed":
      return `Bạn đã bị xóa khỏi ${org}.`;
    default:
      return null;
  }
}
