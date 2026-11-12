"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import {
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/_actions/notifications";
import { badgeText } from "@/lib/chat";
import {
  applyNotificationFrame,
  type BellState,
  describeNotification,
  type NotificationItem,
  readNotificationFrame,
} from "@/lib/notifications";
import { ME } from "@/lib/realtime";
import { useRealtimeOpen, useTopics } from "../realtime/hooks";
import { iconButton } from "../ui";
import NotificationPanel from "./NotificationPanel";

type BellProps = {
  initialUnread: number;
};

// How long the bell swings after a new notification arrives.
const RING_MS = 2400;

// The bell in the header. New notifications arrive on the viewer's own realtime topic at once,
// so a manager sees a new membership request without reloading. See docs/notifications.md.
// Without a socket address the bell still refreshes whenever it is opened.
export default function NotificationBell({ initialUnread }: BellProps) {
  const router = useRouter();
  const [state, setState] = useState<BellState>({
    items: null,
    unread: initialUnread,
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const ringTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loadNotifications();
      if (result.ok) {
        setState({
          items: result.data.items,
          unread: result.data.unread_count,
        });
      }
    } catch {
      // A dropped connection keeps what the bell already shows.
    } finally {
      setLoading(false);
    }
  }, []);

  const onData = useCallback(
    (data: unknown) => {
      const frame = readNotificationFrame(data);
      if (!frame) {
        // A resync means an event was too large to forward; fetch the list again.
        if ((data as { type?: unknown }).type === "resync") {
          refresh();
        }
        return;
      }
      setState((current) => applyNotificationFrame(current, frame));
      if (frame.kind === "created" && !frame.item.read) {
        setAnnouncement(
          `Thông báo mới: ${describeNotification(frame.item).text}`,
        );
        setRinging(true);
        clearTimeout(ringTimer.current);
        ringTimer.current = setTimeout(() => setRinging(false), RING_MS);
      }
    },
    [refresh],
  );

  useTopics([ME], ({ data }) => onData(data));
  // After a reconnect, catch up on what arrived while offline.
  useRealtimeOpen((first) => {
    if (!first) {
      refresh();
    }
  });

  useEffect(() => () => clearTimeout(ringTimer.current), []);

  // Close the panel on a click outside it or on Escape.
  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      refresh();
    }
  }

  async function choose(item: NotificationItem) {
    const href = describeNotification(item).href;
    if (!item.read) {
      setState((current) =>
        applyNotificationFrame(current, { kind: "read", id: item.id }),
      );
      markNotificationRead(item.id).catch(() => {});
    }
    setOpen(false);
    if (href) {
      router.push(href);
    }
  }

  function readAll() {
    setState((current) =>
      applyNotificationFrame(current, { kind: "read_all" }),
    );
    markAllNotificationsRead().catch(() => {});
  }

  const label =
    state.unread > 0 ? `Thông báo, ${state.unread} chưa đọc` : "Thông báo";

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        aria-label={label}
        title="Thông báo"
        aria-expanded={open}
        onClick={toggle}
        className={`${iconButton} relative ${
          state.unread > 0
            ? "border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400"
            : ""
        }`}
      >
        <FiBell
          aria-hidden="true"
          className={ringing ? "animate-bounce motion-reduce:animate-none" : ""}
        />
        {state.unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-teal-700 px-1 text-[0.625rem] font-bold leading-none text-white dark:border-slate-950 dark:bg-teal-400 dark:text-teal-950"
          >
            {badgeText(state.unread)}
          </span>
        ) : null}
      </button>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
      {open ? (
        <NotificationPanel
          items={state.items}
          unread={state.unread}
          loading={loading}
          onChoose={choose}
          onReadAll={readAll}
        />
      ) : null}
    </div>
  );
}
