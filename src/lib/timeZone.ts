// Time zones. The backend stores every moment in UTC and sends it with an offset.
// The app writes it on the viewer's own clock, named by an IANA zone such as
// "Asia/Ho_Chi_Minh" or "America/New_York". Pure code: the web passes the zone it
// read from the `tz` cookie, the phone passes nothing and gets the device zone.

// Used when the viewer's zone is unknown or not a real zone. Most organizations
// on AmigoACT are in Vietnam.
export const DEFAULT_TIME_ZONE = "Asia/Ho_Chi_Minh";
// The browser writes its zone here, so server-rendered pages can use it.
export const TIME_ZONE_COOKIE = "tz";

// IANA names are short and plain: "Area/City", "Etc/GMT+5", "UTC".
const ZONE_NAME = /^[A-Za-z][A-Za-z0-9_+\-/]{0,63}$/;

let listed: Set<string> | null = null;

function listedZones(): Set<string> {
  if (listed === null) {
    const intl = Intl as { supportedValuesOf?: (key: string) => string[] };
    listed = new Set(
      typeof intl.supportedValuesOf === "function"
        ? intl.supportedValuesOf("timeZone")
        : [],
    );
  }
  return listed;
}

// True for a zone this engine knows. The list from Intl.supportedValuesOf is
// checked first; engines also accept aliases outside it, such as "Asia/Saigon"
// and "UTC", and some phones have no list at all.
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !ZONE_NAME.test(value)) {
    return false;
  }
  if (listedZones().has(value)) {
    return true;
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

// A cookie or a form field may hold anything, so an unknown zone falls back.
export function safeTimeZone(value: unknown): string {
  return isTimeZone(value) ? value : DEFAULT_TIME_ZONE;
}

// The zone of this browser or phone.
export function deviceTimeZone(): string {
  try {
    return safeTimeZone(new Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

const formats = new Map<string, Intl.DateTimeFormat>();

// A formatter for one zone, kept for reuse. Without a zone the device zone is
// used, and that formatter is not kept, because the device zone can change.
export function dateFormat(
  locale: string,
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
): Intl.DateTimeFormat {
  if (timeZone === undefined) {
    return new Intl.DateTimeFormat(locale, options);
  }
  const key = `${locale}|${timeZone}|${JSON.stringify(options)}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.DateTimeFormat(locale, { ...options, timeZone });
    formats.set(key, format);
  }
  return format;
}

export type WallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const WALL_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
};

// What a wall clock in the zone shows at that moment. en-GB writes a 24-hour
// clock even on an engine that ignores hourCycle.
export function wallClock(instant: Date, timeZone?: string): WallClock {
  const parts: Record<string, number> = {};
  for (const part of dateFormat("en-GB", WALL_OPTIONS, timeZone).formatToParts(
    instant,
  )) {
    if (part.type !== "literal") {
      parts[part.type] = Number(part.value);
    }
  }
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    // Some engines write midnight as 24.
    hour: parts.hour % 24,
    minute: parts.minute,
    second: parts.second,
  };
}

function wallAsUtc(wall: WallClock): number {
  return Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
}

// Minutes the zone is ahead of UTC at that moment: 420 in Vietnam, -300 in New
// York in winter and -240 in summer.
export function zoneOffsetMinutes(instant: Date, timeZone?: string): number {
  const whole = Math.floor(instant.getTime() / 1000) * 1000;
  return Math.round((wallAsUtc(wallClock(instant, timeZone)) - whole) / 60_000);
}

// The moment a wall-clock time names in the zone. A time that a clock change
// skips moves forward by the gap; a time that happens twice is the first one,
// as calendar apps do.
export function zonedInstant(wall: WallClock, timeZone?: string): Date {
  const asUtc = wallAsUtc(wall);
  const first = zoneOffsetMinutes(new Date(asUtc), timeZone);
  const guess = asUtc - first * 60_000;
  const second = zoneOffsetMinutes(new Date(guess), timeZone);
  if (second !== first) {
    const retry = asUtc - second * 60_000;
    if (zoneOffsetMinutes(new Date(retry), timeZone) === second) {
      return new Date(retry);
    }
  }
  return new Date(guess);
}

function offsetParts(minutes: number): [string, number, number] {
  const sign = minutes < 0 ? "-" : "+";
  const size = Math.abs(minutes);
  return [sign, Math.floor(size / 60), size % 60];
}

// "+07:00", "-05:00", "+05:30": the ISO 8601 offset.
export function isoOffset(minutes: number): string {
  const [sign, hours, rest] = offsetParts(minutes);
  return `${sign}${String(hours).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

// "GMT+7", "GMT-5", "GMT+5:30": the zone named by its offset at that moment,
// the same way the comment times name it.
export function zoneLabel(value: string | Date, timeZone?: string): string {
  const instant = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(instant.getTime())) {
    return "";
  }
  const [sign, hours, rest] = offsetParts(zoneOffsetMinutes(instant, timeZone));
  const minutes = rest ? `:${String(rest).padStart(2, "0")}` : "";
  return `GMT${sign}${hours}${minutes}`;
}

// "Asia/Ho_Chi_Minh (GMT+7)": the zone a form reads its times in.
export function describeZone(timeZone?: string, now = new Date()): string {
  const name = timeZone ?? deviceTimeZone();
  return `${name} (${zoneLabel(now, name)})`;
}
