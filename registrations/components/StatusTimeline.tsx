import type { ReactElement } from "react";
import { FiClock } from "react-icons/fi";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import { useRegistrationHistory } from "../hooks.ts";
import { REGISTRATION_STATUS_LABELS } from "../messages.tsx";

interface StatusTimelineProps {
  activityId: string;
  registrationId: string;
}

// Audit timeline of one application: every recorded status change,
// newest first, with the actor's note when managers left one.
export function StatusTimeline({
  activityId,
  registrationId,
}: StatusTimelineProps): ReactElement {
  const history = useRegistrationHistory(activityId, registrationId);
  const rows = history.data ?? [];

  return (
    <section aria-label="Lịch sử trạng thái" className="flex flex-col gap-2">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiClock className="h-4 w-4" aria-hidden="true" /> Lịch sử trạng thái
      </h4>
      {!history.isPending && rows.length === 0 ? (
        <EmptyState title="Chưa có lịch sử" message="Chưa ghi nhận thay đổi nào." />
      ) : (
        <ol className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((row, index) => (
            <li
              key={`${row.changed_at ?? index}-${index}`}
              className="flex items-start justify-between gap-2 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {REGISTRATION_STATUS_LABELS[row.to_status] ?? row.to_status}
                </p>
                {row.note && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {row.note}
                  </p>
                )}
              </div>
              <p className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {row.changed_at ? formatDateTime(row.changed_at) : "—"}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
