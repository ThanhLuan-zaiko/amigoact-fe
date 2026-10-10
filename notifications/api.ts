import { apiFetch } from "../core/api.ts";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  items: NotificationItem[];
  total: number;
  unread: number;
}

export async function listNotifications(
  limit = 30,
  offset = 0,
): Promise<NotificationPage> {
  return apiFetch<NotificationPage>(
    `/notifications?limit=${limit}&offset=${offset}`,
  );
}

export async function markNotificationRead(
  id: string,
): Promise<NotificationItem> {
  return apiFetch<NotificationItem>(`/notifications/${id}/read`, {
    method: "POST",
  });
}

export interface NotificationPreferences {
  channels: Record<string, boolean>;
  muted_types: string[];
}

export function getPreferences(): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>("/notifications/preferences");
}

export function updatePreferences(
  input: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiFetch<NotificationPreferences>("/notifications/preferences", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
