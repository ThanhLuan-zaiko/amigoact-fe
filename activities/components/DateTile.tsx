import type { ReactElement } from "react";

const MONTHS = [
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
];
const CURRENT_YEAR = new Date().getFullYear();

// Compact calendar tile: month above day, both in the viewer's time zone.
// The year joins the month only when it is not the current year.
export function DateTile({ iso }: { iso: string | null }): ReactElement {
  const parsed = iso === null ? null : new Date(iso);
  const date =
    parsed !== null && !Number.isNaN(parsed.getTime()) ? parsed : null;
  const otherYear = date !== null && date.getFullYear() !== CURRENT_YEAR;
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      {date !== null && (
        <>
          <span className="text-[11px] leading-tight font-medium uppercase text-zinc-500 dark:text-zinc-400">
            {MONTHS[date.getMonth()]}
            {otherYear && ` ${date.getFullYear()}`}
          </span>
          <span className="text-lg font-semibold leading-none text-zinc-900 dark:text-zinc-100">
            {date.getDate()}
          </span>
        </>
      )}
    </div>
  );
}
