import { useState, type ReactElement } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { ActivitySummary } from "../api.ts";
import {
  dayKey,
  groupByDay,
  monthGrid,
  monthKey,
  shiftMonth,
} from "../calendar.ts";

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MONTH_TITLE = new Intl.DateTimeFormat("vi-VN", {
  month: "long",
  year: "numeric",
});

interface ActivityCalendarProps {
  month: Date;
  activities: ActivitySummary[];
  selectedDay: string | null;
  onMonthChange: (month: Date) => void;
  onSelectDay: (day: string | null) => void;
  /** Dense 36px day cells for the desktop rail; 44px targets otherwise. */
  compact?: boolean;
}

// Month grid for the activities. Counts follow the org, status and tag
// filters; tapping a day narrows the feed to that day.
export function ActivityCalendar({
  month,
  activities,
  selectedDay,
  onMonthChange,
  onSelectDay,
  compact = false,
}: ActivityCalendarProps): ReactElement {
  const groups = groupByDay(activities);
  // Captured once per mount so render stays pure.
  const [today] = useState(() => dayKey(new Date()));
  const current = monthKey(month);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tháng trước"
          onClick={() => onMonthChange(shiftMonth(month, -1))}
          icon={<FiChevronLeft className="h-5 w-5" aria-hidden="true" />}
        />
        <h2 className="text-sm font-semibold text-zinc-900 capitalize sm:text-base dark:text-zinc-100">
          {MONTH_TITLE.format(month)}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tháng sau"
          onClick={() => onMonthChange(shiftMonth(month, 1))}
          icon={<FiChevronRight className="h-5 w-5" aria-hidden="true" />}
        />
      </div>
      <div className="grid grid-cols-7 justify-items-center gap-0.5">
        {WEEKDAYS.map((label) => (
          <span
            key={label}
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            {label}
          </span>
        ))}
        {monthGrid(month).map((date) => {
          const key = dayKey(date);
          const count = groups.get(key)?.length ?? 0;
          const outside = monthKey(date) !== current;
          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              size={compact ? "cell" : "icon"}
              aria-pressed={selectedDay === key}
              aria-label={`Ngày ${date.getDate()} tháng ${date.getMonth() + 1}: ${count} hoạt động`}
              onClick={() => onSelectDay(selectedDay === key ? null : key)}
              className={`aria-pressed:border-zinc-900 aria-pressed:bg-zinc-100 dark:aria-pressed:border-zinc-100 dark:aria-pressed:bg-zinc-900 ${outside ? "opacity-50" : ""} ${key === today ? "underline decoration-2 underline-offset-4" : ""}`}
            >
              <span className="flex flex-col items-center leading-none">
                {date.getDate()}
                {count > 0 && (
                  <span className="mt-0.5 rounded-full bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950">
                    {count}
                  </span>
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
