import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiAward,
  FiBell,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiCompass,
  FiGrid,
  FiPlusCircle,
  FiSettings,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";

interface DashboardSidebarProps {
  orgCount: number;
  inviteCount: number;
  unreadCount?: number;
}

interface SidebarEntry {
  to: string;
  label: string;
  Icon: IconType;
  badge?: "invites" | "notifications";
}

interface SidebarGroup {
  label: string;
  entries: SidebarEntry[];
}

// Groups mirror the product surface; entries land as their features do.
const GROUPS: SidebarGroup[] = [
  {
    label: "Chung",
    entries: [
      { to: "/manage/overview", label: "Tổng quan", Icon: FiGrid },
      { to: "/manage/volunteer", label: "Hồ sơ tình nguyện", Icon: FiAward },
      {
        to: "/notifications",
        label: "Thông báo",
        Icon: FiBell,
        badge: "notifications",
      },
    ],
  },
  {
    label: "Tổ chức",
    entries: [
      { to: "/manage/orgs", label: "Tổ chức của tôi", Icon: FiUsers },
      { to: "/manage/orgs/create", label: "Tạo tổ chức", Icon: FiPlusCircle },
    ],
  },
  {
    label: "Hoạt động",
    entries: [
      { to: "/manage/events", label: "Quản lý hoạt động", Icon: FiCalendar },
      { to: "/events", label: "Khám phá", Icon: FiCompass },
      {
        to: "/manage/registrations",
        label: "Đăng ký của tôi",
        Icon: FiClipboard,
      },
      { to: "/manage/hours", label: "Giờ tình nguyện", Icon: FiClock },
      {
        to: "/manage/certificates",
        label: "Chứng nhận",
        Icon: FiStar,
      },
    ],
  },
  {
    label: "Cộng đồng",
    entries: [
      {
        to: "/manage/members",
        label: "Thành viên",
        Icon: FiUser,
        badge: "invites",
      },
      {
        to: "/leaderboard",
        label: "Bảng xếp hạng",
        Icon: FiTrendingUp,
      },
      {
        to: "/manage/audit",
        label: "Nhật ký hoạt động",
        Icon: FiActivity,
      },
      {
        to: "/certificates/verify",
        label: "Xác thực chứng nhận",
        Icon: FiShield,
      },
    ],
  },
  {
    label: "Hệ thống",
    entries: [
      { to: "/manage/settings", label: "Cài đặt", Icon: FiSettings },
    ],
  },
];

const BASE =
  "inline-flex min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-brand dark:focus-visible:outline-brand";

function itemClass(isActive: boolean): string {
  if (isActive) {
    return `${BASE} bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950`;
  }
  return (
    `${BASE} text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 ` +
    "dark:hover:bg-zinc-900"
  );
}

const BADGE_CLASS =
  "ml-auto rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 " +
  "text-xs font-semibold text-amber-700 dark:border-amber-800 " +
  "dark:bg-amber-950 dark:text-amber-400";

export function DashboardSidebar({
  orgCount,
  inviteCount,
  unreadCount = 0,
}: DashboardSidebarProps): ReactElement {
  return (
    <BentoCard className="w-full shrink-0 md:col-span-6 lg:col-span-3 lg:sticky lg:top-20 lg:w-64">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        Không gian quản lý
      </p>
      <h2 className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
        Bảng điều khiển
      </h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {orgCount > 0 ? `Bạn đang quản lý ${orgCount} tổ chức.` : "Tạo tổ chức, câu lạc bộ hay hội nhóm mới."}
      </p>
      <nav aria-label="Điều hướng bảng điều khiển" className="mt-4 flex flex-col gap-3">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.entries.map(({ to, label, Icon, badge }) => (
                <NavLink key={to} to={to} end className={({ isActive }) => itemClass(isActive)}>
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {label}
                  {badge === "invites" && inviteCount > 0 && (
                    <span
                      className={BADGE_CLASS}
                      aria-label={`${inviteCount} lời mời đang chờ`}
                    >
                      {inviteCount}
                    </span>
                  )}
                  {badge === "notifications" && unreadCount > 0 && (
                    <span
                      className={BADGE_CLASS}
                      aria-label={`${unreadCount} thông báo chưa đọc`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </BentoCard>
  );
}
