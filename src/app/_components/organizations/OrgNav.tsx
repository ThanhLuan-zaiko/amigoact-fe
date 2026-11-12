"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiAward,
  FiCalendar,
  FiInbox,
  FiInfo,
  FiMessageCircle,
  FiMessageSquare,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import type { ViewerMembership } from "@/lib/organizations";
import { orgBase } from "@/lib/orgRoutes";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "../ui";

type OrgNavProps = {
  slug: string;
  viewer: ViewerMembership;
};

export default function OrgNav({ slug, viewer }: OrgNavProps) {
  const pathname = usePathname();
  // The owner works under /organizations, everyone else under /org.
  const base = orgBase(slug, viewer.role === "owner");
  const items = [
    { href: base, label: "Giới thiệu", icon: FiInfo, visible: true },
    {
      href: `${base}/posts`,
      label: "Bảng tin",
      icon: FiMessageSquare,
      visible: true,
    },
    {
      href: `${base}/activities`,
      label: "Hoạt động",
      icon: FiCalendar,
      visible: true,
    },
    {
      href: `${base}/chat`,
      label: "Chat",
      icon: FiMessageCircle,
      visible: viewer.status === "active",
    },
    {
      href: `${base}/members`,
      label: "Thành viên",
      icon: FiUsers,
      visible: viewer.role !== null,
    },
    {
      href: `${base}/applications`,
      label: "Yêu cầu",
      icon: FiInbox,
      visible: viewer.can_manage,
    },
    {
      href: `${base}/certificates`,
      label: "Chứng nhận",
      icon: FiAward,
      visible: viewer.can_manage,
    },
    {
      href: `${base}/settings`,
      label: "Cài đặt",
      icon: FiSettings,
      visible: viewer.can_manage,
    },
  ];

  return (
    <nav aria-label="Mục của tổ chức" className={segmentList}>
      {items
        .filter((item) => item.visible)
        .map(({ href, label, icon: Icon }) => {
          const active =
            href === base
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
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
