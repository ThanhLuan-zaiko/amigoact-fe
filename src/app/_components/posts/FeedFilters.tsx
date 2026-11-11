import Link from "next/link";
import type { IconType } from "react-icons";
import { FiBell, FiBookmark, FiList, FiMessageCircle } from "react-icons/fi";
import type { FeedFilter } from "@/lib/posts";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "../ui";

const FILTERS: { value: FeedFilter; label: string; icon: IconType }[] = [
  { value: "all", label: "Tất cả", icon: FiList },
  { value: "announcement", label: "Thông báo", icon: FiBell },
  { value: "discussion", label: "Thảo luận", icon: FiMessageCircle },
  { value: "pinned", label: "Đã ghim", icon: FiBookmark },
];

// Links, not buttons, so a filter is a shareable address and works without JavaScript.
export default function FeedFilters({
  path,
  current,
}: {
  path: string;
  current: FeedFilter;
}) {
  return (
    <nav aria-label="Lọc bài viết" className={segmentList}>
      {FILTERS.map(({ value, label, icon: Icon }) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={value === "all" ? path : `${path}?filter=${value}`}
            aria-label={label}
            title={label}
            aria-current={active ? "page" : undefined}
            className={`${segmentItem} ${active ? segmentActive : segmentIdle}`}
          >
            <Icon aria-hidden="true" />
            <span className={active ? "" : "hidden sm:inline"}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// Cursor paging: the next page starts after the last post of this one.
export function MoreLink({ href }: { href: string | null }) {
  if (!href) {
    return null;
  }
  return (
    <Link
      href={href}
      className="self-center text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
    >
      Xem bài cũ hơn
    </Link>
  );
}
