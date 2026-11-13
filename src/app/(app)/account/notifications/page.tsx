import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getNotificationPreferences } from "@/lib/notificationApi";
import NotificationPreferencesForm from "../../../_components/account/NotificationPreferencesForm";
import { mutedText } from "../../../_components/ui";

export const metadata: Metadata = { title: "Thông báo | AmigoACT" };

async function PreferencesContent() {
  await requireUser("/account/notifications");
  const preferences = await getNotificationPreferences();
  if (!preferences) {
    return (
      <p className={mutedText}>Không tải được cài đặt. Vui lòng thử lại.</p>
    );
  }
  return <NotificationPreferencesForm preferences={preferences} />;
}

export default function NotificationPreferencesPage() {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <PreferencesContent />
    </Suspense>
  );
}
