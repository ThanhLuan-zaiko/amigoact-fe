"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiShield, FiUser } from "react-icons/fi";

const ITEMS = [
  { href: "/account", label: "Thông tin", icon: FiUser },
  { href: "/account/security", label: "Bảo mật", icon: FiShield },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Tài khoản"
      className="flex border-b border-slate-200 dark:border-slate-800"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
              active
                ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
                : "border-transparent text-slate-500 dark:text-slate-400"
            }`}
          >
            <Icon aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
