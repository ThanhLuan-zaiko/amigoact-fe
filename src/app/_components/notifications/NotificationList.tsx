"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { markNotificationRead } from "@/app/_actions/notifications";
import {
  describeNotification,
  type NotificationItem,
} from "@/lib/notifications";
import NotificationRow from "./NotificationRow";

// The notifications page. Opening one marks it read here at once, then goes to its page.
export default function NotificationList({
  items,
}: {
  items: NotificationItem[];
}) {
  const router = useRouter();
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(() => new Set());

  function choose(item: NotificationItem) {
    const href = describeNotification(item).href;
    if (!item.read && !readIds.has(item.id)) {
      setReadIds((current) => new Set(current).add(item.id));
      markNotificationRead(item.id).catch(() => {});
    }
    if (href) {
      router.push(href);
    }
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {items.map((item) => (
        <NotificationRow
          key={item.id}
          item={readIds.has(item.id) ? { ...item, read: true } : item}
          onChoose={choose}
        />
      ))}
    </ul>
  );
}
