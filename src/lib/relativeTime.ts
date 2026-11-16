// Times on comments, the way social apps show them: "Vừa xong", "5 phút",
// "2 giờ", "3 ngày", then the date. The age comes from UTC instants, so it is
// right in every time zone. The date is written in the viewer's own zone: pass
// no timeZone in the browser or on a phone and the device's zone is used.

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function parts(
  date: Date,
  timeZone: string | undefined,
  withYear: boolean,
): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "numeric",
    month: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone,
  }).format(date);
}

function yearIn(date: Date, timeZone: string | undefined): string {
  return new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone }).format(
    date,
  );
}

// A short age for a moment in the past. A time a little in the future (a clock
// running behind) counts as just now. Empty for text that is not a date.
export function relativeTime(
  iso: string,
  now: Date,
  timeZone?: string,
): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const age = now.getTime() - date.getTime();
  if (age < MINUTE) {
    return "Vừa xong";
  }
  if (age < HOUR) {
    return `${Math.floor(age / MINUTE)} phút`;
  }
  if (age < DAY) {
    return `${Math.floor(age / HOUR)} giờ`;
  }
  if (age < WEEK) {
    return `${Math.floor(age / DAY)} ngày`;
  }
  const sameYear = yearIn(date, timeZone) === yearIn(now, timeZone);
  return parts(date, timeZone, !sameYear);
}

// The full moment for a tooltip, in the viewer's zone, with that zone's name so
// nobody mistakes whose clock it is: "16/11/2026, 14:05 GMT+7".
export function absoluteTime(iso: string, timeZone?: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

// Counts the way social apps print them: 999, 1,2K, 12K, 1,5Tr.
export function compactCount(value: number): string {
  if (!Number.isFinite(value) || value < 1000) {
    return String(Math.max(0, Math.trunc(value || 0)));
  }
  const [divisor, unit] = value < 1_000_000 ? [1000, "K"] : [1_000_000, "Tr"];
  const scaled = value / divisor;
  const rounded =
    scaled < 10 ? Math.floor(scaled * 10) / 10 : Math.floor(scaled);
  return `${String(rounded).replace(".", ",")}${unit}`;
}
