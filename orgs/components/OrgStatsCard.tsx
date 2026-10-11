import type { ReactElement } from "react";
import { FiPieChart } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import type { BucketCount } from "../api.ts";
import { ORG_KIND_LABELS } from "../messages.tsx";

interface OrgStatsCardProps {
  total: number;
  counts: BucketCount[];
  isPending: boolean;
}

export function OrgStatsCard({
  total,
  counts,
  isPending,
}: OrgStatsCardProps): ReactElement {
  return (
    <BentoCard className="md:col-span-6 lg:col-span-4">
      <div data-rise className="flex items-center gap-2">
        <FiPieChart
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Phân bố
        </h2>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
        {isPending ? "…" : total}
        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
          tổ chức đang mở
        </span>
      </p>
      {counts.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2.5">
          {counts.map(({ bucket, count }) => (
            <li key={bucket} className="flex items-center gap-2">
              <span className="w-24 truncate text-sm text-zinc-600 dark:text-zinc-400">
                {ORG_KIND_LABELS[bucket] ?? bucket}
              </span>
              <span className="h-1.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                {/* Dynamic measured width: bar length is data-driven. */}
                <span
                  className="block h-1.5 rounded-full bg-brand"
                  style={{
                    width: `${total > 0 ? Math.round((count / total) * 100) : 0}%`,
                  }}
                />
              </span>
              <span className="w-8 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                {count}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!isPending && total === 0 && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Chưa có tổ chức nào để thống kê.
        </p>
      )}
    </BentoCard>
  );
}
