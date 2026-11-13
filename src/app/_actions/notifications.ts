"use server";

import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import { isRoomId } from "@/lib/chat";
import { failureState } from "@/lib/forms";
import type { NotificationPage } from "@/lib/notifications";
import { mutedTypesFrom } from "@/lib/notificationTypes";

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

// The form lists the types a person receives, so every other type goes into muted_types.
// The backend replaces the whole preference, so all three fields are sent.
export async function saveNotificationPreferences(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch("/notifications/preferences", {
    method: "PUT",
    body: {
      inapp: formData.has("channel_inapp"),
      email: formData.has("channel_email"),
      muted_types: mutedTypesFrom(formData.getAll("receive").map(String)),
    },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  return { success: "Đã lưu cài đặt thông báo." };
}
