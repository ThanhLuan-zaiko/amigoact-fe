import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiGrid,
  FiPlusCircle,
  FiSettings,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";

interface DashboardSidebarProps {
  orgCount: number;
  inviteCount: number;
}

interface SidebarEntry {
  to: string;
  label: string;
  Icon: IconType;
}

const ENTRIES: SidebarEntry[] = [
  { to: "/manage/overview", label: "Tổng quan", Icon: FiGrid },
  { to: "/manage/orgs", label: "Tổ chức của tôi", Icon: FiUsers },
  { to: "/manage/orgs/create", label: "Tạo tổ chức", Icon: FiPlusCircle },
  { to: "/manage/events", label: "Sự kiện", Icon: FiCalendar },
  { to: "/manage/members", label: "Thành viên", Icon: FiUser },
  { to: "/manage/settings", label: "Cài đặt", Icon: FiSettings },
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

export function DashboardSidebar({ orgCount, inviteCount }: DashboardSidebarProps): ReactElement {
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
      <nav aria-label="Điều hướng bảng điều khiển" className="mt-4 flex flex-col gap-1">
        {ENTRIES.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => itemClass(isActive)}>
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {label}
            {to === "/manage/members" && inviteCount > 0 && (
              <span
                className="ml-auto rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                aria-label={`${inviteCount} lời mời đang chờ`}
              >
                {inviteCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </BentoCard>
  );
}
