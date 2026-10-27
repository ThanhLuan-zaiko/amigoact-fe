// Role and confirm-dialog copy for the members board. Vietnamese lives in
// .tsx modules only; code and comments stay English.
import { MEMBER_ROLE_LABELS, PERMISSION_LABELS } from "./messages-members.tsx";
import type { OrgRole } from "./members-api.ts";

export const ROLE_COLOR_LABELS: Record<string, string> = {
  zinc: "Xám",
  red: "Đỏ",
  amber: "Vàng",
  emerald: "Xanh lục",
};

// One-click starting points for the role editor. Permissions the viewer
// cannot grant are dropped when a template is applied.
export interface RoleTemplate {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
}

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    key: "event-coordinator",
    name: "Điều phối sự kiện",
    description: "Tạo, chỉnh sửa và vận hành sự kiện của tổ chức.",
    permissions: ["activity:view", "activity:create", "activity:manage", "tag:manage"],
    color: "emerald",
  },
  {
    key: "chat-moderator",
    name: "Kiểm duyệt chat",
    description: "Ghim, xóa tin nhắn không phù hợp và tạm cấm chat.",
    permissions: ["chat:moderate", "chat:timeout"],
    color: "amber",
  },
  {
    key: "channel-owner",
    name: "Quản lý kênh chat",
    description: "Tạo và sắp xếp các kênh trò chuyện.",
    permissions: ["chat:channel"],
    color: "zinc",
  },
  {
    key: "editor",
    name: "Biên tập bài viết",
    description: "Đăng thông báo và quản lý bài viết, bình luận.",
    permissions: ["post:announce", "post:manage"],
    color: "zinc",
  },
  {
    key: "member-manager",
    name: "Quản lý thành viên",
    description: "Xem, mời và tạm khóa thành viên.",
    permissions: ["member:view", "member:invite", "member:suspend"],
    color: "red",
  },
  {
    key: "librarian",
    name: "Quản lý thư viện",
    description: "Quản lý tệp trong thư viện của tổ chức.",
    permissions: ["media:manage"],
    color: "zinc",
  },
];

export function roleLabel(name: string): string {
  return MEMBER_ROLE_LABELS[name] ?? name;
}

export function permissionLabel(code: string): string {
  return PERMISSION_LABELS[code] ?? code;
}

// One selectable role in the invite and role-assignment dialogs.
export interface RoleOption {
  key: string;
  label: string;
  hint: string;
  // Permission summary line; empty for roles without a catalog entry.
  detail: string;
}

export const MEMBER_OPTION: RoleOption = {
  key: "member",
  label: roleLabel("member"),
  hint: "Quyền mặc định của mọi thành viên.",
  detail: "",
};

export const ADMIN_OPTION: RoleOption = {
  key: "admin",
  label: roleLabel("admin"),
  hint: "Vai trò hệ thống, chỉ chủ sở hữu mới gán được.",
  detail: "",
};

export function permissionSummary(codes: string[], max = 3): string {
  if (codes.length === 0) return "";
  const labels = codes.map(permissionLabel);
  const shown = labels.slice(0, max).join(", ");
  return labels.length > max
    ? `${shown} và ${labels.length - max} quyền khác`
    : shown;
}

// Accent- and case-insensitive text for search (plain "dieu" finds accented "Dieu").
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

// Matches a role by name, description or any permission label it carries.
export function filterRoles(roles: OrgRole[], query: string): OrgRole[] {
  const needle = fold(query.trim());
  if (needle === "") return roles;
  return roles.filter((role) =>
    fold(
      [
        role.is_system ? roleLabel("admin") : role.name,
        role.description,
        ...role.permissions.map(permissionLabel),
      ].join(" "),
    ).includes(needle),
  );
}

export function customRoleOption(role: OrgRole): RoleOption {
  return {
    key: role.name,
    label: role.name,
    hint: role.description,
    detail: permissionSummary(role.permissions),
  };
}

// Resolves a role a member already holds, whether or not the viewer may
// still grant it.
export function optionForRole(name: string, roles: OrgRole[]): RoleOption {
  if (name === "admin") return ADMIN_OPTION;
  const role = roles.find((item) => item.name === name);
  return role
    ? customRoleOption(role)
    : { key: name, label: roleLabel(name), hint: "", detail: "" };
}

export interface ConfirmCopy {
  title: string;
  message: string;
  confirmLabel: string;
  busyLabel: string;
}

export type MemberConfirmKind = "remove" | "leave" | "revoke";

// Mutation key understood by memberMutationToast for each confirm kind.
export const CONFIRM_ACTIONS: Record<MemberConfirmKind, string> = {
  remove: "removed",
  leave: "left",
  revoke: "revoked",
};

export function memberConfirmCopy(
  kind: MemberConfirmKind,
  name: string,
): ConfirmCopy {
  switch (kind) {
    case "remove":
      return {
        title: `Xóa ${name} khỏi tổ chức?`,
        message: `${name} sẽ mất quyền truy cập tổ chức, các phòng chat và mọi vai trò đang giữ. Bạn có thể mời lại sau.`,
        confirmLabel: "Xóa thành viên",
        busyLabel: "Đang xóa…",
      };
    case "leave":
      return {
        title: "Rời khỏi tổ chức?",
        message:
          "Bạn sẽ mất quyền truy cập tổ chức và các phòng chat, và cần được mời lại để tham gia.",
        confirmLabel: "Rời tổ chức",
        busyLabel: "Đang xử lý…",
      };
    case "revoke":
      return {
        title: "Thu hồi lời mời?",
        message: `Lời mời gửi cho ${name} sẽ bị hủy và họ không thể chấp nhận được nữa.`,
        confirmLabel: "Thu hồi lời mời",
        busyLabel: "Đang thu hồi…",
      };
  }
}

export function roleDeleteCopy(
  role: Pick<OrgRole, "name" | "member_count">,
): ConfirmCopy {
  return {
    title: `Xóa vai trò ${role.name}?`,
    message:
      role.member_count > 0
        ? `${role.member_count} thành viên đang giữ vai trò này sẽ mất vai trò và các quyền đi kèm. Thao tác không thể hoàn tác.`
        : "Vai trò chưa gán cho ai. Thao tác không thể hoàn tác.",
    confirmLabel: "Xóa vai trò",
    busyLabel: "Đang xóa…",
  };
}
