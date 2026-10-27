export function formatDateTime(value: string | null): string {
  if (!value) return "Chưa xếp lịch";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

// Weekday and clock range in the viewer's zone, for example a Saturday from
// 08:00 to 11:30. An open end shows the start time only.
export function formatEventWhen(start: string | null, end: string | null): string {
  if (!start) return "Chưa xếp lịch";
  const from = new Date(start);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long" }).format(from);
  const clock = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const range = end ? `${clock.format(from)}–${clock.format(new Date(end))}` : clock.format(from);
  return `${weekday} · ${range}`;
}

// The Vietnamese label for today, or for a day within the next week; null otherwise.
export function relativeDayLabel(start: string | null, now: Date = new Date()): string | null {
  if (!start) return null;
  const from = new Date(start);
  const startOfDay = (moment: Date) =>
    new Date(moment.getFullYear(), moment.getMonth(), moment.getDate()).getTime();
  const days = Math.round((startOfDay(from) - startOfDay(now)) / 86_400_000);
  if (days === 0) return "Hôm nay";
  if (days > 0 && days <= 7) return `Còn ${days} ngày`;
  return null;
}

export function toLocalInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromLocalInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
