"use client";

import type { IconType } from "react-icons";
import {
  FiAward,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiUserMinus,
  FiUserPlus,
  FiUsers,
  FiUserX,
} from "react-icons/fi";
import {
  describeNotification,
  type NotificationItem,
  timeAgo,
} from "@/lib/notifications";
import { iconButton, mutedText } from "../ui";

type PanelProps = {
  // Null while the first page is on its way.
  items: NotificationItem[] | null;
  unread: number;
  loading: boolean;
  onChoose: (item: NotificationItem) => void;
  onReadAll: () => void;
};

function iconFor(type: string): IconType {
  if (type === "membership_requested") {
    return FiUserPlus;
  }
  if (type === "member_left") {
    return FiUserMinus;
  }
  if (type === "membership_removed") {
    return FiUserX;
  }
  if (type.startsWith("membership_")) {
    return FiUsers;
  }
  if (type === "hours_awarded") {
    return FiClock;
  }
  if (type.startsWith("certificate_")) {
    return FiAward;
  }
  if (type.startsWith("registration_") || type.startsWith("activity_")) {
    return FiCalendar;
  }
  return FiBell;
}

function Row({
  item,
  onChoose,
}: {
  item: NotificationItem;
  onChoose: (item: NotificationItem) => void;
}) {
  const view = describeNotification(item);
  const Icon = iconFor(item.type);
  return (
    <li>
      <button
        type="button"
        onClick={() => onChoose(item)}
        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-teal-700 dark:hover:bg-slate-900 dark:focus-visible:outline-teal-400 ${
          item.read ? "" : "bg-teal-50 dark:bg-teal-950/40"
        }`}
      >
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          <Icon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`text-sm text-slate-900 dark:text-slate-100 ${
              item.read ? "" : "font-semibold"
            }`}
          >
            {view.text}
          </span>
          {view.detail ? (
            <span className="line-clamp-2 border-l-2 border-slate-300 pl-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-400">
              {view.detail}
            </span>
          ) : null}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {timeAgo(item.created_at)}
          </span>
        </span>
        {item.read ? null : (
          <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-teal-700 dark:bg-teal-400">
            <span className="sr-only">Chưa đọc</span>
          </span>
        )}
      </button>
    </li>
  );
}

// On a phone the panel spans the screen under the header; from sm it hangs under the bell.
export default function NotificationPanel({
  items,
  unread,
  loading,
  onChoose,
  onReadAll,
}: PanelProps) {
  return (
    <section
      aria-label="Thông báo"
      className="fixed inset-x-4 top-16 z-20 mt-2 flex max-h-[70vh] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:w-96 dark:border-slate-800 dark:bg-slate-950"
    >
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Thông báo
        </h2>
        <button
          type="button"
          onClick={onReadAll}
          disabled={unread === 0}
          aria-label="Đánh dấu tất cả đã đọc"
          title="Đánh dấu tất cả đã đọc"
          className={`${iconButton} h-8 w-8 disabled:opacity-40`}
        >
          <FiCheckCircle aria-hidden="true" />
        </button>
      </header>
      {items === null ? (
        <p className={`px-4 py-6 text-center ${mutedText}`}>Đang tải…</p>
      ) : items.length === 0 ? (
        <p className={`px-4 py-6 text-center ${mutedText}`}>
          {loading ? "Đang tải…" : "Chưa có thông báo nào"}
        </p>
      ) : (
        <ul className="divide-y divide-slate-200 overflow-y-auto dark:divide-slate-800">
          {items.map((item) => (
            <Row key={item.id} item={item} onChoose={onChoose} />
          ))}
        </ul>
      )}
    </section>
  );
}
