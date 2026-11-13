"use client";

import Link from "next/link";
import { FiCheckCircle } from "react-icons/fi";
import type { NotificationItem } from "@/lib/notifications";
import { iconButton, mutedText } from "../ui";
import NotificationRow from "./NotificationRow";

type PanelProps = {
  // Null while the first page is on its way.
  items: NotificationItem[] | null;
  unread: number;
  loading: boolean;
  onChoose: (item: NotificationItem) => void;
  onReadAll: () => void;
  onClose: () => void;
};

// On a phone the panel spans the screen under the header; from sm it hangs under the bell.
export default function NotificationPanel({
  items,
  unread,
  loading,
  onChoose,
  onReadAll,
  onClose,
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
            <NotificationRow key={item.id} item={item} onChoose={onChoose} />
          ))}
        </ul>
      )}
      <Link
        href="/notifications"
        onClick={onClose}
        className="border-t border-slate-200 px-4 py-2 text-center text-sm font-semibold text-teal-700 transition-colors hover:underline dark:border-slate-800 dark:text-teal-400"
      >
        Xem tất cả
      </Link>
    </section>
  );
}
