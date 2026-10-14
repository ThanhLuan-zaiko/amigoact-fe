import type { ReactElement } from "react";
import { FiAward, FiClock } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { formatDateTime } from "../activities/dates.tsx";
import { useMyHours } from "./hooks.ts";
import {
  HOUR_SOURCE_LABELS,
  HOUR_STATUS_LABELS,
} from "./messages.tsx";

const STATUS_STYLES: Record<string, string> = {
  pending:
    "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
  approved:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400",
  rejected:
    "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400",
};

export function MyHoursPage(): ReactElement {
  const mine = useMyHours();

  return (
    <>
      <Section>
        <div data-rise className="flex items-center gap-2">
          <FiAward className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Tổng giờ tình nguyện
          </h1>
        </div>
        {mine.isPending && <LoadingState label="Đang tải…" />}
        {mine.isError && (
          <ErrorState
            title="Không tải được"
            message={mine.error.message}
          />
        )}
        {mine.data && mine.data.summaries.length === 0 && (
          <EmptyState
            title="Chưa có giờ được duyệt"
            message="Giờ tình nguyện hiện tại đây sau khi ban tổ chức duyệt."
          />
        )}
        {mine.data && mine.data.summaries.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {mine.data.summaries.map((s) => (
              <li
                key={s.term}
                className="rounded-xl border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  {s.term}
                </p>
                <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {s.total_hours}
                  <span className="ml-1 text-sm font-normal text-zinc-500">
                    giờ
                  </span>
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {s.activities_count} hoạt động
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section>
        <div data-rise className="flex items-center gap-2">
          <FiClock className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Lịch sử giờ
          </h2>
        </div>
        {mine.isPending && <LoadingState label="Đang tải…" />}
        {mine.data && mine.data.entries.length === 0 && (
          <EmptyState
            title="Chưa có bản ghi"
            message="Check-out tại sự kiện sẽ ghi giờ vào sổ của bạn."
          />
        )}
        {mine.data && mine.data.entries.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {mine.data.entries.map((row) => (
              <li
                key={row.entry_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {row.hours ?? 0} giờ
                    <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      {HOUR_SOURCE_LABELS[row.source ?? ""] ??
                        row.source}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formatDateTime(row.recorded_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[row.status ?? ""] ?? STATUS_STYLES.pending}`}
                >
                  {HOUR_STATUS_LABELS[row.status ?? ""] ?? row.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
