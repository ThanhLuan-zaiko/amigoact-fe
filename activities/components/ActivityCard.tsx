import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock } from "react-icons/fi";
import type { ActivitySummary } from "../api.ts";
import { formatDateTime } from "../dates.tsx";
import { ACTIVITY_STATUS_LABELS } from "../messages.tsx";

const STATUS_TONE: Record<string, string> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  published:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  ongoing: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function StatusChip({ status }: { status: string }): ReactElement {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status] ?? STATUS_TONE.draft}`}
    >
      {ACTIVITY_STATUS_LABELS[status] ?? status}
    </span>
  );
}

interface ActivityCardProps {
  activity: ActivitySummary;
  href: string;
  trailing?: ReactElement;
}

export function ActivityCard({
  activity,
  href,
  trailing,
}: ActivityCardProps): ReactElement {
  return (
    <Link
      to={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 transition-colors hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-500"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
            {activity.title}
          </h4>
          <StatusChip status={activity.status} />
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
          <FiCalendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {formatDateTime(activity.start_at)}
        </p>
        {activity.tags.length > 0 && (
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {activity.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.slug}
                className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800"
              >
                #{tag.name}
              </span>
            ))}
            {activity.tags.length > 3 &&
              `+${activity.tags.length - 3}`}
          </p>
        )}
      </div>
      {trailing ?? (
        <FiClock
          className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-600"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
