import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiBell, FiSettings } from "react-icons/fi";
import { requireUser } from "@/lib/auth";
import { getNotificationPage } from "@/lib/notificationApi";
import { NOTIFICATION_EVENTS } from "@/lib/notificationTypes";
import { ME } from "@/lib/realtime";
import { listQuery } from "@/lib/tagLinks";
import EmptyState from "../../_components/EmptyState";
import MarkAllReadButton from "../../_components/notifications/MarkAllReadButton";
import NotificationList from "../../_components/notifications/NotificationList";
import LiveRefresh from "../../_components/realtime/LiveRefresh";
import {
  iconButton,
  mutedText,
  panel,
  segmentActive,
  segmentIdle,
  segmentItem,
  segmentList,
} from "../../_components/ui";

export const metadata: Metadata = { title: "Thông báo | AmigoACT" };

// The largest offset the backend accepts. Anything bigger starts from the first page.
const MAX_OFFSET = 100_000;

// The offset comes from the address, so a value that is not a whole number is ignored.
function readOffset(value: string | string[] | undefined): number {
  const offset = Number(value);
  return typeof value === "string" &&
    Number.isInteger(offset) &&
    offset > 0 &&
    offset <= MAX_OFFSET
    ? offset
    : 0;
}

function Filters({ unreadOnly }: { unreadOnly: boolean }) {
  const filters = [
    { href: "/notifications", label: "Tất cả", active: !unreadOnly },
    {
      href: `/notifications${listQuery({ unread: "1" })}`,
      label: "Chưa đọc",
      active: unreadOnly,
    },
  ];
  return (
    <nav aria-label="Lọc thông báo" className={segmentList}>
      {filters.map(({ href, label, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`${segmentItem} justify-center ${active ? segmentActive : segmentIdle}`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

async function NotificationsContent({
  searchParams,
}: PageProps<"/notifications">) {
  await requireUser("/notifications");
  const query = await searchParams;
  const unreadOnly = query.unread === "1";
  const page = await getNotificationPage(readOffset(query.offset), unreadOnly);
  const more =
    page?.next_offset == null
      ? null
      : `/notifications${listQuery({
          unread: unreadOnly ? "1" : null,
          offset: String(page.next_offset),
        })}`;

  return (
    <>
      <LiveRefresh topic={ME} types={NOTIFICATION_EVENTS} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Filters unreadOnly={unreadOnly} />
        <MarkAllReadButton disabled={!page || page.unread_count === 0} />
      </div>
      {page === null ? (
        <p className={mutedText}>Không tải được thông báo. Vui lòng thử lại.</p>
      ) : page.items.length === 0 ? (
        <EmptyState
          title={unreadOnly ? "Bạn đã đọc hết thông báo" : "Chưa có thông báo"}
          description="Thông báo về đăng ký, tổ chức, giờ tình nguyện và chứng nhận sẽ hiện ở đây."
        />
      ) : (
        <section className={`${panel} px-4`}>
          <NotificationList items={page.items} />
        </section>
      )}
      {more ? (
        <Link
          href={more}
          className="self-center text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          Xem thông báo cũ hơn
        </Link>
      ) : null}
    </>
  );
}

export default function NotificationsPage(props: PageProps<"/notifications">) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <FiBell aria-hidden="true" />
          Thông báo
        </h1>
        <Link
          href="/account/notifications"
          aria-label="Cài đặt thông báo"
          title="Cài đặt thông báo"
          className={iconButton}
        >
          <FiSettings aria-hidden="true" />
        </Link>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <NotificationsContent {...props} />
      </Suspense>
    </div>
  );
}
