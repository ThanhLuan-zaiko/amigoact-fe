import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import {
  useNotificationsRealtime,
  useUnreadCount,
} from "../../notifications/hooks.ts";

export function NotificationBell({
  userId,
}: {
  userId: string | undefined;
}): ReactElement {
  const inbox = useUnreadCount(userId !== undefined);
  const unread = inbox.data?.unread ?? 0;

  // Badge refreshes the moment a notification lands on the socket.
  useNotificationsRealtime(userId);

  return (
    <Link
      to="/notifications"
      aria-label={
        unread > 0 ? `Thông báo (${unread} chưa đọc)` : "Thông báo"
      }
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:outline-brand"
    >
      <FiBell className="h-5 w-5" aria-hidden="true" />
      {unread > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
        >
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
