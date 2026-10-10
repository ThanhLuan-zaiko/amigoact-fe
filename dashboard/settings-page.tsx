import type { ReactElement } from "react";
import { FiSettings } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { NotificationPrefsCard } from "../notifications/components/NotificationPrefsCard.tsx";

export function DashboardSettingsPage(): ReactElement {
  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-6">
        <div data-rise className="flex items-center gap-2">
          <FiSettings className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Cài đặt tài khoản
          </h3>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Quản lý tùy chọn thông báo và bảo mật tài khoản của bạn.
        </p>
      </BentoCard>
      <NotificationPrefsCard />
    </>
  );
}
