"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiShield, FiUser } from "react-icons/fi";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "../ui";

const ITEMS = [
  { href: "/account", label: "Thông tin", icon: FiUser },
  { href: "/account/security", label: "Bảo mật", icon: FiShield },
];

export default function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Tài khoản" className={segmentList}>
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`${segmentItem} ${active ? segmentActive : segmentIdle}`}
          >
            <Icon aria-hidden="true" />
            {/* On a phone only the current section keeps its word. */}
            <span className={active ? "" : "hidden sm:inline"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
