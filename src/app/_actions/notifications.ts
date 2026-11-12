"use server";

import { authedFetch } from "@/lib/auth";
import { isRoomId } from "@/lib/chat";
import type { NotificationPage } from "@/lib/notifications";

// The bell calls these from the browser, so the access token stays in its httpOnly cookie.

export type BellResult<T> = { ok: true; data: T } | { ok: false };

const PAGE_SIZE = 20;

export async function loadNotifications(): Promise<
  BellResult<NotificationPage>
> {
  const result = await authedFetch<NotificationPage>(
    `/notifications?limit=${PAGE_SIZE}&offset=0`,
    { method: "GET" },
  );
  return result.ok ? { ok: true, data: result.data } : { ok: false };
}

export async function markNotificationRead(
  id: string,
): Promise<BellResult<null>> {
  // The id comes from the browser, so it is checked before it reaches a path.
  if (!isRoomId(id)) {
    return { ok: false };
  }
  const result = await authedFetch(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: "POST" },
  );
  return result.ok ? { ok: true, data: null } : { ok: false };
}

export async function markAllNotificationsRead(): Promise<BellResult<null>> {
  const result = await authedFetch("/notifications/read-all", {
    method: "POST",
  });
  return result.ok ? { ok: true, data: null } : { ok: false };
}
