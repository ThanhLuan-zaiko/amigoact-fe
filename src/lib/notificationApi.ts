import "server-only";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import type { NotificationPage } from "./notifications";
import type { NotificationPreferences } from "./notificationTypes";

export const NOTIFICATIONS_PAGE_SIZE = 20;

// Read these behind a Suspense boundary, because they use the session.
async function getData<T>(path: string): Promise<T | null> {
  const result = await backendFetch<T>(path, {
    method: "GET",
    token: await getAccessToken(),
  });
  return result.ok ? result.data : null;
}

export function getNotificationPage(
  offset: number,
  unreadOnly: boolean,
): Promise<NotificationPage | null> {
  const query = new URLSearchParams({
    limit: String(NOTIFICATIONS_PAGE_SIZE),
    offset: String(offset),
  });
  if (unreadOnly) {
    query.set("unread_only", "true");
  }
  return getData(`/notifications?${query}`);
}

export function getNotificationPreferences(): Promise<NotificationPreferences | null> {
  return getData("/notifications/preferences");
}
