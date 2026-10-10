import type { ReactElement } from "react";
import { FiBell, FiCheck } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { RequireAuth } from "../auth/components/guards.tsx";
import {
  useMarkNotificationRead,
  useNotifications,
} from "./hooks.ts";
import {
  notificationMessage,
  notificationTypeIcon,
  notificationTypeLabel,
} from "./messages.tsx";
import type { NotificationItem } from "./api.ts";

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationRow({
  item,
  pending,
  onRead,
}: {
  item: NotificationItem;
  pending: boolean;
  onRead: (id: string) => void;
}): ReactElement {
  const unread = item.status === "unread";
  return (
    <li
      className={`flex items-start gap-3 rounded-xl border p-3 sm:p-4 ${
        unread
          ? "border-brand/40 bg-brand/5 dark:border-brand/30 dark:bg-brand/10"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          unread
            ? "bg-brand text-zinc-950 dark:bg-brand dark:text-zinc-950"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
        }`}
      >
        {notificationTypeIcon(item.type, "h-4 w-4")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {item.title}
          </p>
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {notificationTypeLabel(item.type)}
          </span>
        </div>
        {item.body && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {item.body}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {formatTime(item.created_at)}
        </p>
      </div>
      {unread && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Đánh dấu đã đọc"
          disabled={pending}
          onClick={() => onRead(item.id)}
        >
          <FiCheck className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </li>
  );
}

function NotificationInbox(): ReactElement {
  const inbox = useNotifications(50, 0);
  const markRead = useMarkNotificationRead();

  if (inbox.isPending) {
    return <LoadingState label="Đang tải thông báo…" />;
  }
  if (inbox.isError) {
    const code =
      inbox.error instanceof ApiError ? inbox.error.code : "REQUEST_FAILED";
    return (
      <ErrorState
        title="Không tải được thông báo"
        message={notificationMessage(code)}
      />
    );
  }
  const items = inbox.data?.items ?? [];
  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có thông báo"
        message="Khi có lời mời, kết quả duyệt hoặc cập nhật mới, chúng sẽ xuất hiện ở đây."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          item={item}
          pending={markRead.isPending}
          onRead={(id) => markRead.mutate(id)}
        />
      ))}
    </ul>
  );
}

export function NotificationsPage(): ReactElement {
  return (
    <RequireAuth>
      <BentoCard className="col-span-1 md:col-span-6 lg:col-span-8 lg:col-start-3">
        <div className="mb-4 flex items-center gap-2">
          <FiBell
            className="h-5 w-5 text-zinc-900 dark:text-brand"
            aria-hidden="true"
          />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Thông báo
          </h1>
        </div>
        <NotificationInbox />
      </BentoCard>
    </RequireAuth>
  );
}
