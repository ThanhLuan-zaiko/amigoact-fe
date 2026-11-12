// The tabs, drafts and trash of an organization's activity list, like its posts.

import { tagSlug } from "./tagInput";

export type ActivityFilter = "all" | "upcoming" | "completed" | "cancelled";

const FILTERS = new Set<ActivityFilter>([
  "all",
  "upcoming",
  "completed",
  "cancelled",
]);

// The ?filter= value of the page address. Anything unknown shows every activity.
export function activityFilter(value: unknown): ActivityFilter {
  return typeof value === "string" && FILTERS.has(value as ActivityFilter)
    ? (value as ActivityFilter)
    : "all";
}

export function orgActivitiesPath(slug: string): string {
  return `/org/${encodeURIComponent(slug)}/activities`;
}

// The list address for a tab. A tag filter stays on when the tab changes.
export function activityFilterHref(
  slug: string,
  filter: ActivityFilter,
  tag: string | null = null,
): string {
  const query = new URLSearchParams();
  if (filter !== "all") {
    query.set("filter", filter);
  }
  if (tag) {
    query.set("tag", tag);
  }
  const text = query.toString();
  return text ? `${orgActivitiesPath(slug)}?${text}` : orgActivitiesPath(slug);
}

// Where a tag chip on an activity leads: that organization's activities with the tag.
export function activityTagHref(orgSlug: string, tag: string): string {
  return activityFilterHref(orgSlug, "all", tagSlug(tag));
}

// What the backend calls each tab. "all" sends nothing.
export function backendStatus(filter: ActivityFilter | "draft"): string | null {
  return filter === "all" ? null : filter;
}

export const EMPTY_MESSAGES: Record<
  ActivityFilter,
  { title: string; description: string }
> = {
  all: {
    title: "Chưa có hoạt động",
    description: "Hoạt động của tổ chức sẽ hiện ở đây.",
  },
  upcoming: {
    title: "Chưa có hoạt động sắp tới",
    description: "Hoạt động đã đăng và chưa bắt đầu sẽ hiện ở đây.",
  },
  completed: {
    title: "Chưa có hoạt động đã kết thúc",
    description: "Hoạt động đã ghi giờ tình nguyện sẽ hiện ở đây.",
  },
  cancelled: {
    title: "Không có hoạt động bị hủy",
    description: "Hoạt động bị hủy sẽ hiện ở đây.",
  },
};

export type ActivityTrashItem = {
  id: string;
  title: string;
  start_at: string | null;
  deleted_at: string;
  purge_at: string;
  can_purge: boolean;
};

export type ActivityTrashPage = {
  items: ActivityTrashItem[];
  next_before: string | null;
};
