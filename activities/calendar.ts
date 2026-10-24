import type { ActivitySummary } from "./api.ts";

// Local-time calendar helpers for the /manage/events month view. Days are
// keyed as "YYYY-MM-DD" and months as "YYYY-MM" so they can live in the URL.

export function dayKey(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function monthKey(date: Date): string {
  return dayKey(date).slice(0, 7);
}

// Local day of a scheduled activity; null for rows without a start time.
export function activityDayKey(activity: ActivitySummary): string | null {
  return activity.start_at === null
    ? null
    : dayKey(new Date(activity.start_at));
}

export function inMonth(activity: ActivitySummary, month: Date): boolean {
  const key = activityDayKey(activity);
  return key !== null && key.startsWith(monthKey(month));
}

// First day of the month named by "YYYY-MM"; falls back to this month.
export function parseMonth(value: string | null, now = new Date()): Date {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (match) {
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) {
      return new Date(Number(match[1]), month - 1, 1);
    }
  }
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function shiftMonth(month: Date, delta: number): Date {
  return new Date(month.getFullYear(), month.getMonth() + delta, 1);
}

// Six full weeks, Monday first, covering the month that contains `month`.
export function monthGrid(month: Date): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset);
  return Array.from(
    { length: 42 },
    (_, index) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + index),
  );
}

export function groupByDay(
  activities: ActivitySummary[],
): Map<string, ActivitySummary[]> {
  const groups = new Map<string, ActivitySummary[]>();
  for (const activity of activities) {
    const key = activityDayKey(activity);
    if (key === null) continue;
    groups.set(key, [...(groups.get(key) ?? []), activity]);
  }
  return groups;
}
