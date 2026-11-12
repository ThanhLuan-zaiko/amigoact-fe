import { getAccessToken, getCurrentUser } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import NotificationBell from "./NotificationBell";

// Reads the session, so AppHeader renders it behind a Suspense boundary.
// Guests have no notifications, so they see no bell.
export default async function HeaderBell() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  const count = await backendFetch<{ count: number }>(
    "/notifications/unread-count",
    { method: "GET", token: await getAccessToken() },
  );
  return <NotificationBell initialUnread={count.ok ? count.data.count : 0} />;
}
