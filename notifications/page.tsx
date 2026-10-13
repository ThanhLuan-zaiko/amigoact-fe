import { useEffect, useRef, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck, FiChevronRight } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { RequireAuth } from "../auth/components/guards.tsx";
import { pushToast } from "../core/toast.ts";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "./hooks.ts";
import {
  notificationMessage,
  notificationTypeIcon,
  notificationTypeLabel,
} from "./messages.tsx";
import type { NotificationItem } from "./api.ts";
import { notificationLink } from "./utils.ts";

function toastApiError(error: ApiError): void {
  pushToast({ tone: "error", title: notificationMessage(error.code) });
}

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
  fresh,
  pending,
  onOpen,
}: {
  item: NotificationItem;
  fresh: boolean;
  pending: boolean;
  onOpen: (item: NotificationItem) => void;
}): ReactElement {
  const unread = item.status === "unread";
  // "fresh" rows arrived before this visit and stay highlighted even
  // though opening the inbox already swept them read server-side.
  const highlight = unread || fresh;
  const link = notificationLink(item);
  const actionable = unread || link !== null;
  const inner = (
    <>
      <span
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          highlight
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
      {link !== null ? (
        <FiChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
          aria-hidden="true"
        />
      ) : (
        unread && (
          <FiCheck
            className="mt-1 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
            aria-hidden="true"
          />
        )
      )}
    </>
  );
  return (
    <li
      className={`rounded-xl border p-3 sm:p-4 ${
        highlight
          ? "border-brand/40 bg-brand/5 dark:border-brand/30 dark:bg-brand/10"
          : "border-zinc-200 dark:border-zinc-800"
      }`}
    >
      {actionable ? (
        <button
          type="button"
          onClick={() => onOpen(item)}
          disabled={pending}
          aria-label={
            link !== null
              ? `Mở thông báo: ${item.title}`
              : `Đánh dấu đã đọc: ${item.title}`
          }
          className="flex w-full cursor-pointer items-start gap-3 rounded-lg text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:outline-brand"
        >
          {inner}
        </button>
      ) : (
        <div className="flex w-full items-start gap-3">{inner}</div>
      )}
    </li>
  );
}

function NotificationInbox(): ReactElement {
  const inbox = useNotifications(50, 0);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  const [freshIds, setFreshIds] = useState<Set<string> | null>(null);
  const swept = useRef(false);

  // Opening the inbox counts as reading: snapshot which rows were unread
  // (kept highlighted this visit), then sweep the badge server-side once.
  if (inbox.data !== undefined && freshIds === null) {
    setFreshIds(
      new Set(
        inbox.data.items
          .filter((item) => item.status === "unread")
          .map((item) => item.id),
      ),
    );
  }
  useEffect(() => {
    if (swept.current || freshIds === null || freshIds.size === 0) return;
    swept.current = true;
    markAll.mutate(undefined, { onError: toastApiError });
  }, [freshIds, markAll]);

  const openItem = (item: NotificationItem): void => {
    if (item.status === "unread") {
      markRead.mutate(item.id, { onError: toastApiError });
    }
    const link = notificationLink(item);
    if (link !== null) {
      navigate(link);
    }
  };

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
  const fresh = freshIds ?? new Set<string>();
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          item={item}
          fresh={fresh.has(item.id)}
          pending={markRead.isPending}
          onOpen={openItem}
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
