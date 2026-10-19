// Member-domain Vietnamese copy, split from messages.tsx to keep every
// .tsx under the 250-line cap. Code and comments stay English.
import { toVietnameseDashboardMessage } from "./messages.tsx";

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
  "tag:manage": "Quản lý thẻ",
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
      "tag:manage",
    ],
  },
];

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  active: "Hoạt động",
  invited: "Đã mời",
  suspended: "Tạm khóa",
  left: "Đã rời",
  revoked: "Đã thu hồi",
};

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
      return toVietnameseDashboardMessage("MEMBER_UPDATED");
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
    case "revoked":
      return actor
        ? `${actor} đã thu hồi lời mời của ${target}.`
        : `Lời mời của ${target} đã bị thu hồi.`;
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
    case "revoked":
      return `Lời mời tham gia ${org} đã bị thu hồi.`;
    default:
      return null;
  }
}
