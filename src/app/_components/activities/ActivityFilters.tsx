import Link from "next/link";
import type { IconType } from "react-icons";
import { FiCheckCircle, FiClock, FiList, FiXCircle } from "react-icons/fi";
import { type ActivityFilter, activityFilterHref } from "@/lib/activityList";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "../ui";

const FILTERS: { value: ActivityFilter; label: string; icon: IconType }[] = [
  { value: "all", label: "Tất cả", icon: FiList },
  { value: "upcoming", label: "Sắp tới", icon: FiClock },
  { value: "completed", label: "Đã kết thúc", icon: FiCheckCircle },
  { value: "cancelled", label: "Đã hủy", icon: FiXCircle },
];

// The same tab row as the post feed. Links, so a tab is a shareable address.
export default function ActivityFilters({
  slug,
  current,
  tag = null,
}: {
  slug: string;
  current: ActivityFilter;
  tag?: string | null;
}) {
  return (
    <nav aria-label="Lọc hoạt động" className={segmentList}>
      {FILTERS.map(({ value, label, icon: Icon }) => {
        const active = value === current;
        return (
          <Link
            key={value}
            href={activityFilterHref(slug, value, tag)}
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
