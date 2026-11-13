// Roles and permissions of an organization, in the style of Discord.

export type RoleBadge = { id: string; name: string; color: string };

export type RoleInfo = RoleBadge & {
  position: number;
  permissions: string[];
  member_count: number;
  // True when the role sits below the viewer's top role. Whether the viewer may then
  // edit, delete or hand it out depends on the permission for that action.
  below_you: boolean;
};

export type RoleList = { items: RoleInfo[]; catalog: string[] };

type PermissionInfo = { code: string; label: string; hint: string };

export type PermissionModule = {
  id: string;
  label: string;
  permissions: PermissionInfo[];
};

// A code is "module.action", so a role can create without being able to delete.
// A code the backend adds later still saves and shows its code until it is listed here.
export const ADMINISTRATOR = "administrator";

export const MODULES: PermissionModule[] = [
  {
    id: "organization",
    label: "Tổ chức",
    permissions: [
      {
        code: "organization.update",
        label: "Sửa hồ sơ",
        hint: "Hồ sơ, ảnh, bộ sưu tập, hiển thị công khai",
      },
    ],
  },
  {
    id: "roles",
    label: "Vai trò",
    permissions: [
      {
        code: "roles.create",
        label: "Tạo",
        hint: "Tạo vai trò thấp hơn mình",
      },
      {
        code: "roles.update",
        label: "Sửa",
        hint: "Sửa quyền, tên, màu và thứ tự vai trò thấp hơn mình",
      },
      {
        code: "roles.delete",
        label: "Xóa",
        hint: "Xóa vai trò thấp hơn mình",
      },
      {
        code: "roles.assign",
        label: "Gán",
        hint: "Gán hoặc gỡ vai trò cho thành viên",
      },
    ],
  },
  {
    id: "members",
    label: "Thành viên",
    permissions: [
      {
        code: "members.remove",
        label: "Xóa thành viên",
        hint: "Xóa người có vai trò thấp hơn mình",
      },
      {
        code: "applications.review",
        label: "Duyệt yêu cầu",
        hint: "Duyệt hoặc từ chối yêu cầu tham gia",
      },
    ],
  },
  {
    id: "activities",
    label: "Hoạt động",
    permissions: [
      { code: "activities.create", label: "Tạo", hint: "Tạo hoạt động mới" },
      {
        code: "activities.update",
        label: "Sửa",
        hint: "Sửa, đăng, kết thúc, hủy hoạt động và ca",
      },
      {
        code: "activities.delete",
        label: "Xóa",
        hint: "Xóa hoạt động, ca và khôi phục từ thùng rác",
      },
      {
        code: "activities.registrations",
        label: "Đăng ký",
        hint: "Xem và duyệt đăng ký tham gia",
      },
    ],
  },
  {
    id: "attendance",
    label: "Điểm danh",
    permissions: [
      {
        code: "attendance.checkin",
        label: "Điểm danh",
        hint: "Mở phiên, đánh dấu và xác nhận điểm danh",
      },
      {
        code: "attendance.hours",
        label: "Giờ tình nguyện",
        hint: "Điều chỉnh giờ và đặt quy tắc tính giờ",
      },
      {
        code: "attendance.appeals",
        label: "Khiếu nại",
        hint: "Duyệt hoặc từ chối khiếu nại điểm danh",
      },
    ],
  },
  {
    id: "certificates",
    label: "Chứng nhận",
    permissions: [
      {
        code: "certificates.templates",
        label: "Mẫu",
        hint: "Tạo và sửa mẫu chứng nhận",
      },
      {
        code: "certificates.issue",
        label: "Cấp",
        hint: "Cấp, thu hồi và khôi phục chứng nhận",
      },
    ],
  },
  {
    id: "posts",
    label: "Bài viết",
    permissions: [
      {
        code: "posts.announce",
        label: "Thông báo",
        hint: "Đăng bài thông báo",
      },
      { code: "posts.pin", label: "Ghim", hint: "Ghim và bỏ ghim bài" },
      {
        code: "posts.moderate",
        label: "Kiểm duyệt",
        hint: "Ẩn, xóa, khôi phục bài và bình luận của người khác",
      },
    ],
  },
  {
    id: "chat",
    label: "Chat",
    permissions: [
      { code: "channels.create", label: "Tạo kênh", hint: "Tạo kênh chat" },
      {
        code: "channels.manage",
        label: "Quản lý kênh",
        hint: "Lưu trữ kênh và quản lý thành viên kênh",
      },
      {
        code: "channels.read_restricted",
        label: "Đọc kênh hạn chế",
        hint: "Đọc kênh hạn chế mà không cần được thêm vào",
      },
    ],
  },
];

const ALL_CODES = MODULES.flatMap((module) =>
  module.permissions.map((permission) => permission.code),
);

export function moduleCodes(module: PermissionModule): string[] {
  return module.permissions.map((permission) => permission.code);
}

// Ready-made sets, so a common role takes one click. They only fill the checkboxes:
// the person can still add or remove any permission before saving.
export const PRESETS: { id: string; label: string; codes: string[] }[] = [
  { id: "none", label: "Chỉ để nhận diện", codes: [] },
  {
    id: "reviewer",
    label: "Duyệt thành viên",
    codes: ["applications.review", "members.remove"],
  },
  {
    id: "organizer",
    label: "Tổ chức hoạt động",
    codes: [
      "activities.create",
      "activities.update",
      "activities.registrations",
      "attendance.checkin",
      "attendance.appeals",
    ],
  },
  {
    id: "moderator",
    label: "Kiểm duyệt nội dung",
    codes: ["posts.pin", "posts.moderate", "channels.read_restricted"],
  },
  {
    id: "editor",
    label: "Biên tập bài viết",
    codes: ["posts.announce", "posts.pin"],
  },
  {
    id: "staff",
    label: "Điều hành (không quản lý vai trò)",
    codes: ALL_CODES.filter((code) => !code.startsWith("roles.")),
  },
  { id: "all", label: "Toàn quyền", codes: ALL_CODES },
];

export function permissionLabel(code: string): string {
  for (const module of MODULES) {
    const found = module.permissions.find((item) => item.code === code);
    if (found) {
      return `${module.label}: ${found.label}`;
    }
  }
  return code === ADMINISTRATOR ? "Quản trị viên" : code;
}

// One line per module that has permissions: "Hoạt động: Tạo, Sửa".
export function summarize(
  permissions: string[],
): { module: string; actions: string[] }[] {
  const held = new Set(permissions);
  const lines = MODULES.map((module) => ({
    module: module.label,
    actions: module.permissions
      .filter((permission) => held.has(permission.code))
      .map((permission) => permission.label),
  })).filter((line) => line.actions.length > 0);
  if (held.has(ADMINISTRATOR)) {
    lines.unshift({ module: "Tất cả", actions: ["Quản trị viên"] });
  }
  return lines;
}

// The backend allows any #rrggbb, but Tailwind only builds classes written out in
// full, so the interface offers a fixed palette. Other colors show as the default.
export const ROLE_COLORS: { value: string; label: string; dot: string }[] = [
  { value: "", label: "Mặc định", dot: "bg-slate-400" },
  { value: "#14b8a6", label: "Xanh ngọc", dot: "bg-teal-500" },
  { value: "#0ea5e9", label: "Xanh da trời", dot: "bg-sky-500" },
  { value: "#22c55e", label: "Xanh lá", dot: "bg-green-500" },
  { value: "#f59e0b", label: "Vàng cam", dot: "bg-amber-500" },
  { value: "#f97316", label: "Cam", dot: "bg-orange-500" },
  { value: "#f43f5e", label: "Hồng", dot: "bg-rose-500" },
  { value: "#8b5cf6", label: "Tím", dot: "bg-violet-500" },
];

export function roleDot(color: string): string {
  return (
    ROLE_COLORS.find((item) => item.value === color.toLowerCase())?.dot ??
    ROLE_COLORS[0].dot
  );
}

// The owner holds every permission, and so does anyone with `administrator`.
export function hasPermission(
  viewer: { permissions: string[] },
  code: string,
): boolean {
  return (
    viewer.permissions.includes(ADMINISTRATOR) ||
    viewer.permissions.includes(code)
  );
}

// Holds any permission of a module, such as every "activities.*" code.
export function hasModule(
  viewer: { permissions: string[] },
  module: string,
): boolean {
  return (
    viewer.permissions.includes(ADMINISTRATOR) ||
    viewer.permissions.some((code) => code.startsWith(`${module}.`))
  );
}

// Roles the viewer may move, in order, with one swapped with its neighbour.
// Returns null when the role is already at that end or is not movable.
export function movedOrder(
  roles: RoleInfo[],
  roleId: string,
  direction: "up" | "down",
): string[] | null {
  const movable = roles.filter((role) => role.below_you);
  const index = movable.findIndex((role) => role.id === roleId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= movable.length) {
    return null;
  }
  const ids = movable.map((role) => role.id);
  [ids[index], ids[target]] = [ids[target], ids[index]];
  return ids;
}

// The roles a viewer may hand out to others: the ones below their own top role.
export function assignableRoles(roles: RoleInfo[]): RoleInfo[] {
  return roles.filter((role) => role.below_you);
}
