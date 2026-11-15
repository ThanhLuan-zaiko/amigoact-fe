import Link from "next/link";
import {
  BUCKETS,
  type Bucket,
  dashboardHref,
  RANGES,
  type RangeKey,
} from "@/lib/hoursStats";
import { segmentActive, segmentIdle, segmentItem, segmentList } from "../ui";

type StatsFiltersProps = {
  range: RangeKey;
  bucket: Bucket;
  // The page the links lead to, such as /hours or an organization's hours page.
  base: string;
};

// Plain links, so the filters work without client code and the address can be shared.
export default function StatsFilters({
  range,
  bucket,
  base,
}: StatsFiltersProps) {
  const groups = [
    {
      label: "Khoảng thời gian",
      items: RANGES.map((item) => ({
        key: item.key,
        label: item.label,
        href: dashboardHref(item.key, bucket, base),
        active: item.key === range,
      })),
    },
    {
      label: "Gộp theo",
      items: BUCKETS.map((item) => ({
        key: item.key,
        label: item.label,
        href: dashboardHref(range, item.key, base),
        active: item.key === bucket,
      })),
    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {groups.map((group) => (
        <nav key={group.label} aria-label={group.label} className={segmentList}>
          {group.items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              scroll={false}
              aria-current={item.active ? "page" : undefined}
              className={`${segmentItem} justify-center ${item.active ? segmentActive : segmentIdle}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ))}
    </div>
  );
}
