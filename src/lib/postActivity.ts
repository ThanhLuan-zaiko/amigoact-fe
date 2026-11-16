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
  timeZone?: string,
): { value: string; label: string }[] {
  const list = linkableActivities(items);
  if (current && !list.some((item) => item.id === current.id)) {
    list.unshift(current);
  }
  return list.map((item) => {
    const when = formatDateTime(item.start_at, timeZone);
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

// The tabs beside a published post: its activity (when it has one), the
// comments, and the organization's other posts.
export type PostSideTab = "activity" | "comments" | "posts";

export function postSideTabs(
  activity: ActivitySummary | null | undefined,
): PostSideTab[] {
  return activity ? ["activity", "comments", "posts"] : ["comments", "posts"];
}

// The tab in the address when the post has it. Otherwise the activity while
// people can still sign up, and the comments in every other case.
export function pickPostSideTab(
  value: string | null | undefined,
  activity: ActivitySummary | null | undefined,
  now = new Date(),
): PostSideTab {
  const tabs = postSideTabs(activity);
  const asked = tabs.find((tab) => tab === value);
  if (asked) {
    return asked;
  }
  return activity && canSignUp(activity, now) ? "activity" : "comments";
}

// Widths for the bar of seats taken, written out so the styling stays static.
export const SEAT_WIDTHS = [
  "w-0",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-[50%]",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-full",
] as const;

// The bar class for the share of seats taken, in tenths. A taken seat always
// shows, and the bar is full only when every seat is taken. Null without a limit.
export function seatWidthClass(
  taken: number,
  capacity: number | null,
): string | null {
  if (capacity === null || capacity <= 0) {
    return null;
  }
  const share = Math.min(1, Math.max(0, taken / capacity));
  let step = Math.round(share * 10);
  if (share > 0 && step === 0) {
    step = 1;
  }
  if (share < 1 && step === 10) {
    step = 9;
  }
  return SEAT_WIDTHS[step];
}
