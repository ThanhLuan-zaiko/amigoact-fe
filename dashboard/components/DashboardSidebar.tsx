import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocation } from "react-router-dom";
import {
  FiActivity,
  FiAward,
  FiBell,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiCompass,
  FiGrid,
  FiMessageCircle,
  FiMessageSquare,
  FiPlusCircle,
  FiSettings,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { expandPanel } from "../../core/motion.ts";
import { SidebarGroupSection } from "./SidebarGroup.tsx";
import type { SidebarEntry, SidebarGroup } from "./SidebarGroup.tsx";

interface DashboardSidebarProps {
  orgCount: number;
  inviteCount: number;
  unreadCount?: number;
}

// Groups mirror the product surface; entries land as their features do.
const GROUPS: SidebarGroup[] = [
  {
    label: "Chung",
    entries: [
      { to: "/manage/overview", label: "Tổng quan", Icon: FiGrid },
      { to: "/manage/volunteer", label: "Hồ sơ tình nguyện", Icon: FiAward },
      { to: "/notifications", label: "Thông báo", Icon: FiBell, badge: "notifications" },
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
      { to: "/manage/registrations", label: "Đăng ký của tôi", Icon: FiClipboard },
      { to: "/manage/hours", label: "Giờ tình nguyện", Icon: FiClock },
      { to: "/manage/certificates", label: "Chứng nhận", Icon: FiStar },
    ],
  },
  {
    label: "Cộng đồng",
    entries: [
      { to: "/manage/members", label: "Thành viên", Icon: FiUser, badge: "invites" },
      { to: "/leaderboard", label: "Bảng xếp hạng", Icon: FiTrendingUp },
      { to: "/manage/audit", label: "Nhật ký hoạt động", Icon: FiActivity },
      { to: "/certificates/verify", label: "Xác thực chứng nhận", Icon: FiShield },
    ],
  },
  {
    label: "Không gian làm việc",
    entries: [
      { to: "/manage/board", label: "Bảng tin", Icon: FiMessageSquare },
      { to: "/manage/chat", label: "Trò chuyện", Icon: FiMessageCircle },
    ],
  },
  {
    label: "Hệ thống",
    entries: [
      { to: "/manage/settings", label: "Cài đặt", Icon: FiSettings },
    ],
  },
];

// The entry owning the current route: exact match first, then the
// longest prefix so nested manage routes still resolve to their group.
function entryForPath(pathname: string): SidebarEntry | null {
  let best: SidebarEntry | null = null;
  for (const group of GROUPS) {
    for (const entry of group.entries) {
      if (pathname === entry.to) return entry;
      const prefix = entry.to + "/";
      if (
        pathname.startsWith(prefix) &&
        (best === null || entry.to.length > best.to.length)
      ) best = entry;
    }
  }
  return best;
}

export function DashboardSidebar({
  orgCount,
  inviteCount,
  unreadCount = 0,
}: DashboardSidebarProps): ReactElement {
  const { pathname } = useLocation();
  const activeEntry = useMemo(() => entryForPath(pathname), [pathname]);
  const activeGroup = useMemo(
    () =>
      activeEntry === null
        ? null
        : (GROUPS.find((g) => g.entries.includes(activeEntry))?.label ??
          null),
    [activeEntry],
  );
  // Manual toggles (group, mobile nav) only hold while the route they
  // were made under stays current; navigation re-syncs to the route.
  const [manual, setManual] = useState<{
    path: string;
    label: string | null;
  } | null>(null);
  const openLabel =
    manual !== null && manual.path === pathname ? manual.label : activeGroup;
  const [mobileNav, setMobileNav] = useState<{
    path: string;
    open: boolean;
  } | null>(null);
  const mobileOpen =
    mobileNav !== null && mobileNav.path === pathname && mobileNav.open;
  const navRef = useRef<HTMLElement | null>(null);
  const navMounted = useRef(false);

  useEffect(() => {
    if (!navMounted.current) {
      navMounted.current = true;
      return;
    }
    if (mobileOpen && navRef.current) expandPanel(navRef.current);
  }, [mobileOpen]);

  function toggle(label: string): void {
    setManual({
      path: pathname,
      label: openLabel === label ? null : label,
    });
  }

  const ActiveIcon = activeEntry?.Icon;

  return (
    <BentoCard
      className={`w-full shrink-0 md:col-span-6 lg:col-span-3 lg:sticky lg:top-20 lg:w-64 ${
        // An open mobile nav can outgrow the viewport; unpinning it keeps
        // every group reachable by ordinary page scroll.
        mobileOpen ? "" : "sticky top-16 z-30"
      }`}
    >
      <div className="flex items-center gap-2 lg:hidden">
        {ActiveIcon && (
          <ActiveIcon
            className="h-5 w-5 shrink-0 text-zinc-900 dark:text-brand"
            aria-hidden="true"
          />
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {activeEntry?.label ?? "Bảng điều khiển"}
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setMobileNav({ path: pathname, open: !mobileOpen })
          }
          aria-expanded={mobileOpen}
          aria-controls="dashboard-nav"
          className="px-3 text-xs"
          icon={
            mobileOpen ? (
              <FiChevronDown className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiChevronRight className="h-4 w-4" aria-hidden="true" />
            )
          }
        >
          Điều hướng
        </Button>
      </div>
      <div className="hidden lg:block">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
          Không gian quản lý
        </p>
        <h2 className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Bảng điều khiển
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {orgCount > 0 ? `Bạn đang quản lý ${orgCount} tổ chức.` : "Tạo tổ chức, câu lạc bộ hay hội nhóm mới."}
        </p>
      </div>
      <nav
        ref={navRef}
        id="dashboard-nav"
        aria-label="Điều hướng bảng điều khiển"
        className={`${mobileOpen ? "mt-3 flex" : "hidden"} flex-col gap-1 lg:mt-4 lg:flex`}
      >
        {GROUPS.map((group, index) => (
          <SidebarGroupSection
            key={group.label}
            group={group}
            regionId={`dashboard-nav-group-${index}`}
            open={openLabel === group.label}
            inviteCount={inviteCount}
            unreadCount={unreadCount}
            onToggle={toggle}
          />
        ))}
      </nav>
    </BentoCard>
  );
}
