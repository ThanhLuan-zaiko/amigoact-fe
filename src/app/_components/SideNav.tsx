"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiAward,
  FiCalendar,
  FiClock,
  FiCompass,
  FiHome,
  FiMessageSquare,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { isActivePath } from "./navigation";

type NavItem = {
  label: string;
  href: string;
  icon: IconType;
};

const navItems: NavItem[] = [
  { label: "Trang chủ", href: "/", icon: FiHome },
  { label: "Khám phá", href: "/explore", icon: FiCompass },
  { label: "Hoạt động", href: "/activities", icon: FiCalendar },
  { label: "Giờ tình nguyện", href: "/hours", icon: FiClock },
  { label: "Chứng nhận", href: "/certificates", icon: FiAward },
  { label: "Tổ chức của tôi", href: "/organizations", icon: FiUsers },
  { label: "Tin nhắn", href: "/messages", icon: FiMessageSquare },
  { label: "Hồ sơ", href: "/account", icon: FiUser },
];

type SideNavProps = {
  // The joined organizations, rendered on the server.
  children: ReactNode;
};

export default function SideNav({ children }: SideNavProps) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Điều hướng chính"
      className="flex flex-col gap-1 text-[15px]"
    >
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors ${
              active
                ? "border-teal-700 font-bold text-teal-700 dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            }`}
          >
            <Icon aria-hidden="true" className="shrink-0" />
            {label}
          </Link>
        );
      })}

      <h2 className="mt-6 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Tổ chức đã tham gia
      </h2>
      {children}
    </nav>
  );
}
