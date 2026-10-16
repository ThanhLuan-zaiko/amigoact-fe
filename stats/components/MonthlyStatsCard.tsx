import type { ReactElement } from "react";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { useMyOrgs } from "../../dashboard/hooks.ts";
import { useMonthlyStats } from "../hooks.ts";

/** Materialized per-month rollup table for the org dashboard. */
export function MonthlyStatsCard(): ReactElement | null {
  const orgs = useMyOrgs(false, { limit: 1 });
  const stats = useMonthlyStats(orgs.data?.items[0]?.id);
  if (stats.isPending) {
    return (
      <Section>
        <LoadingState label="Đang tải thống kê tháng…" />
      </Section>
    );
  }
  const rows = stats.data ?? [];
  if (rows.length === 0) return null;

  return (
    <Section>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Thống kê theo tháng
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 pr-3 font-medium">Tháng</th>
              <th className="py-2 pr-3 font-medium">Hoạt động</th>
              <th className="py-2 pr-3 font-medium">Người tham gia</th>
              <th className="py-2 pr-3 font-medium">Giờ</th>
              <th className="py-2 font-medium">Chứng nhận</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.month}
                className="border-b border-zinc-100 text-zinc-700 last:border-0 dark:border-zinc-800 dark:text-zinc-300"
              >
                <td className="py-2 pr-3 font-medium">{r.month}</td>
                <td className="py-2 pr-3">{r.activities}</td>
                <td className="py-2 pr-3">{r.participants}</td>
                <td className="py-2 pr-3">{r.hours}</td>
                <td className="py-2">{r.certificates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
