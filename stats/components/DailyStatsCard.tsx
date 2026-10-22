import type { ReactElement } from "react";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useDailyStats } from "../hooks.ts";

interface DailyStatsCardProps {
  activityId: string;
}

/** Materialized per-day rollup for one activity (manager view). */
export function DailyStatsCard({
  activityId,
}: DailyStatsCardProps): ReactElement | null {
  const stats = useDailyStats(activityId);
  if (stats.isPending) {
    return <LoadingState label="Đang tải thống kê ngày…" />;
  }
  const rows = (stats.data ?? []).slice(0, 14);
  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Thống kê theo ngày
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="py-2 pr-3 font-medium">Ngày</th>
              <th className="py-2 pr-3 font-medium">Đăng ký</th>
              <th className="py-2 pr-3 font-medium">Điểm danh</th>
              <th className="py-2 font-medium">Giờ ghi nhận</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.day}
                className="border-b border-zinc-100 text-zinc-700 last:border-0 dark:border-zinc-800 dark:text-zinc-300"
              >
                <td className="py-2 pr-3 font-medium">{r.day}</td>
                <td className="py-2 pr-3">{r.registrations}</td>
                <td className="py-2 pr-3">{r.attendees}</td>
                <td className="py-2">{r.hours_awarded}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
