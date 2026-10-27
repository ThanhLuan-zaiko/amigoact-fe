import type { NotificationItem } from "./api.ts";

function str(value: unknown): string | null {
  return typeof value === "string" && value !== "" ? value : null;
}

// Notification data_json payloads carry backend identifiers; this maps each
// type to the deepest route the app can resolve for it.
export function notificationLink(item: NotificationItem): string | null {
  const data = item.data ?? {};
  const activityLink = (): string | null => {
    const orgId = str(data.org_id);
    const slug = str(data.activity_slug);
    return orgId !== null && slug !== null
      ? `/events/${orgId}/${slug}`
      : null;
  };
  switch (item.type) {
    case "membership":
      return "/manage/members";
    case "organization": {
      const slug = str(data.org_slug);
      return slug !== null ? `/orgs/${slug}` : "/manage/orgs";
    }
    case "announcement": {
      const orgId = str(data.org_id);
      const postId = str(data.post_id);
      if (orgId === null) return null;
      // Older rows may lack post_id; the org board is still the closest page.
      return postId !== null
        ? `/manage/board/post?org=${orgId}&post=${postId}`
        : `/manage/board?org=${orgId}`;
    }
    case "registration":
    case "staff":
    case "review":
      return activityLink();
    case "certificate":
      return "/manage/certificates";
    case "hours":
      return "/manage/hours";
    default:
      return null;
  }
}
