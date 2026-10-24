import type { ActivitySummary } from "./api.ts";

// The online label or the venue, then awarded hours when there are any.
export function placeLine(activity: ActivitySummary): string | null {
  const place = activity.is_remote ? "Trực tuyến" : activity.location;
  const hours =
    activity.hours_awarded > 0 ? `${activity.hours_awarded} giờ` : null;
  const parts = [place, hours].filter((part) => Boolean(part));
  return parts.length === 0 ? null : parts.join(" · ");
}
