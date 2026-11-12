import { type ActivitySummary, formatDateTime } from "./activities";

// Posts may point only at activities people can see. The backend checks it too.
const LINKABLE = new Set(["published", "completed"]);

export function linkableActivities(
  items: ActivitySummary[],
): ActivitySummary[] {
  return items.filter((item) => LINKABLE.has(item.status));
}

// Options for the post form. The activity a post already points at stays in the
// list even when it is no longer linkable, so saving does not drop it silently.
export function activityOptions(
  items: ActivitySummary[],
  current: ActivitySummary | null = null,
): { value: string; label: string }[] {
  const list = linkableActivities(items);
  if (current && !list.some((item) => item.id === current.id)) {
    list.unshift(current);
  }
  return list.map((item) => {
    const when = formatDateTime(item.start_at);
    return {
      value: item.id,
      label: when ? `${item.title} · ${when}` : item.title,
    };
  });
}

// Whether the post can offer "Đăng ký": the activity is published, has not started,
// and its registration deadline has not passed.
export function canSignUp(
  activity: ActivitySummary,
  now = new Date(),
): boolean {
  if (activity.status !== "published") {
    return false;
  }
  const closes = activity.registration_deadline ?? activity.start_at;
  return closes === null || new Date(closes) > now;
}

// A full activity still lets people join the waitlist, so this only words the button.
export function isFull(activity: ActivitySummary): boolean {
  return (
    activity.capacity !== null && activity.seats_taken >= activity.capacity
  );
}
