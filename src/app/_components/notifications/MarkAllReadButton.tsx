"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { markAllNotificationsRead } from "@/app/_actions/notifications";
import { secondaryButton } from "../ui";

// Marks every notification read, then reloads the list from the server.
export default function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function markAll() {
    setPending(true);
    try {
      await markAllNotificationsRead();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={markAll}
      disabled={disabled || pending}
      className={`${secondaryButton} disabled:opacity-40`}
    >
      <FiCheckCircle aria-hidden="true" />
      Đánh dấu tất cả đã đọc
    </button>
  );
}
