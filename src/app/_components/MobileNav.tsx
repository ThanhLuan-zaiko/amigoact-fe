"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiCompass,
  FiHome,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";
import { isActivePath } from "./navigation";

type MobileItem = {
  label: string;
  href: string;
  icon: IconType;
};

const mobileItems: MobileItem[] = [
  { label: "Trang chủ", href: "/", icon: FiHome },
  { label: "Khám phá", href: "/explore", icon: FiCompass },
  { label: "Hoạt động", href: "/activities", icon: FiCalendar },
  { label: "Tin nhắn", href: "/messages", icon: FiMessageSquare },
  { label: "Hồ sơ", href: "/account", icon: FiUser },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Điều hướng nhanh"
      className="fixed inset-x-0 bottom-0 z-10 flex h-14 items-center justify-around border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-950"
    >
      {mobileItems.map(({ label, href, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`flex h-10 w-12 items-center justify-center rounded-md border transition-colors ${
              active
                ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon aria-hidden="true" className="text-xl" />
          </Link>
        );
      })}
    </nav>
  );
}
