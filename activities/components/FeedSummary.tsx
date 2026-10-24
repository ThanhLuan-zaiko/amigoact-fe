import type { ReactElement } from "react";
import type { FeedSummaryCounts } from "../feed-utils.ts";

const TILES: { key: keyof FeedSummaryCounts; label: string }[] = [
  { key: "total", label: "Tất cả" },
  { key: "live", label: "Đang diễn ra" },
  { key: "upcoming", label: "Sắp tới" },
  { key: "drafts", label: "Bản nháp" },
];

// Headline numbers for the feed. Counts follow whatever filters are active.
export function FeedSummary({
  counts,
}: {
  counts: FeedSummaryCounts;
}): ReactElement {
  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {TILES.map(({ key, label }) => (
        <div
          key={key}
          className="flex flex-col gap-0.5 rounded-xl border border-zinc-200 px-3 py-2 dark:border-zinc-800"
        >
          <dt className="text-xs text-zinc-500 dark:text-zinc-400">{label}</dt>
          <dd className="text-xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {counts[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}
