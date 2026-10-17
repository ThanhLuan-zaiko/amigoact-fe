import type { IconType } from "react-icons";
import {
  FiAward,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiCompass,
  FiGrid,
  FiHeart,
  FiHome,
  FiKey,
  FiList,
  FiMessageCircle,
  FiMessageSquare,
  FiSettings,
  FiShield,
  FiStar,
  FiUser,
  FiUserCheck,
} from "react-icons/fi";

export interface NavEntry {
  to: string;
  label: string;
  Icon: IconType;
  /** Only an exact path match counts as active (the home route). */
  end?: boolean;
  badge?: "invites" | "notifications" | "chat";
  /** Hidden from guests. */
  auth?: boolean;
}

export interface RouteTitle {
  title: string;
  /** Parent route for the header back arrow on sub-pages. */
  parent?: string;
}

// Left rail destinations in X order; the manage entry opens /manage/overview.
export const PRIMARY_LINKS: NavEntry[] = [
  { to: "/", label: "Trang chủ", Icon: FiHome, end: true },
  { to: "/events", label: "Sự kiện", Icon: FiCompass },
  {
    to: "/notifications",
    label: "Thông báo",
    Icon: FiBell,
    badge: "notifications",
    auth: true,
  },
  {
    to: "/manage/chat",
    label: "Trò chuyện",
    Icon: FiMessageCircle,
    badge: "chat",
    auth: true,
  },
  { to: "/leaderboard", label: "Bảng xếp hạng", Icon: FiAward },
  { to: "/manage", label: "Bảng điều khiển", Icon: FiGrid, auth: true },
  { to: "/profile", label: "Hồ sơ", Icon: FiUser, auth: true },
];

export const MANAGE_ROOT = "/manage";
export const MANAGE_LABEL = "Bảng điều khiển";

// Workspace sections rendered as the ManageTabs strip on /manage pages.
export const MANAGE_LINKS: NavEntry[] = [
  { to: "/manage/overview", label: "Tổng quan", Icon: FiBarChart2 },
  { to: "/manage/volunteer", label: "Hồ sơ tình nguyện", Icon: FiHeart },
  { to: "/manage/orgs", label: "Tổ chức của tôi", Icon: FiBriefcase },
  { to: "/manage/events", label: "Quản lý hoạt động", Icon: FiCalendar },
  { to: "/manage/registrations", label: "Đăng ký của tôi", Icon: FiClipboard },
  { to: "/manage/hours", label: "Giờ tình nguyện", Icon: FiClock },
  { to: "/manage/certificates", label: "Chứng nhận", Icon: FiStar },
  {
    to: "/manage/members",
    label: "Thành viên",
    Icon: FiUserCheck,
    badge: "invites",
  },
  { to: "/manage/board", label: "Bảng tin", Icon: FiMessageSquare },
  { to: "/manage/audit", label: "Nhật ký hoạt động", Icon: FiList },
];

// Secondary destinations behind the rail's More popover (X "More").
export const MORE_LINKS: NavEntry[] = [
  {
    to: "/certificates/verify",
    label: "Xác thực chứng nhận",
    Icon: FiCheckCircle,
  },
  { to: "/manage/settings", label: "Cài đặt", Icon: FiSettings, auth: true },
];

export const ADMIN_LINK: NavEntry = {
  to: "/admin",
  label: "Quản trị",
  Icon: FiShield,
};

export const PASSWORD_LINK: NavEntry = {
  to: "/change-password",
  label: "Đổi mật khẩu",
  Icon: FiKey,
};

// Bottom tab bar on phones (X keeps five icons there).
export const TAB_PATHS_MEMBER = [
  "/",
  "/events",
  "/notifications",
  "/manage/chat",
  "/manage",
];
export const TAB_PATHS_GUEST = ["/", "/events", "/leaderboard"];

// Header titles for routes that are not nav destinations.
export const ROUTE_TITLES: Record<string, RouteTitle> = {
  "/orgs": { title: "Tổ chức", parent: "/" },
  "/login": { title: "Đăng nhập" },
  "/register": { title: "Tạo tài khoản" },
  "/verify": { title: "Xác thực email" },
  "/forgot-password": { title: "Quên mật khẩu" },
  "/reset-password": { title: "Đặt lại mật khẩu" },
  "/change-password": { title: "Đổi mật khẩu" },
  "/admin": { title: "Quản trị" },
  "/admin/orgs": { title: "Quản trị" },
  "/admin/admins": { title: "Quản trị" },
  "/volunteers": { title: "Hồ sơ tình nguyện viên", parent: "/leaderboard" },
  "/manage/orgs/create": { title: "Tạo tổ chức", parent: "/manage/orgs" },
  "/manage/board/write": { title: "Viết bài", parent: "/manage/board" },
  "/manage/board/post": { title: "Bài viết", parent: "/manage/board" },
};
