import type { ReactElement } from "react";
import { FiCheckCircle, FiKey, FiLogOut, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { useLogoutAll, useSession } from "../hooks.ts";

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

export function ProfileCard(): ReactElement {
  const session = useSession();
  const logoutAll = useLogoutAll();
  const profile = session.data ?? null;

  if (!profile) {
    return (
      <BentoCard className="md:col-span-4 md:col-start-2 lg:col-span-6 lg:col-start-4">
        <EmptyState
          title="Chưa đăng nhập"
          message="Vui lòng đăng nhập để xem hồ sơ của bạn."
          actionLabel="Đăng nhập"
        />
      </BentoCard>
    );
  }

  return (
    <BentoCard className="md:col-span-4 md:col-start-2 lg:col-span-6 lg:col-start-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-lg font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
        >
          {initialOf(profile.full_name)}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            {profile.full_name}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <FiCheckCircle
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            {profile.email_verified
              ? "Email đã xác minh"
              : "Email chưa xác minh"}
          </p>
        </div>
      </div>
      <dl className="mt-4 flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2">
          <FiMail className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <dt className="sr-only">Email</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{profile.email}</dd>
        </div>
        <div className="flex items-center gap-2">
          <FiPhone className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <dt className="sr-only">Số điện thoại</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{profile.phone}</dd>
        </div>
        <div className="flex items-center gap-2">
          <FiUser className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <dt className="sr-only">Họ và tên</dt>
          <dd className="text-zinc-900 dark:text-zinc-100">{profile.full_name}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
        <Button
          to="/change-password"
          variant="secondary"
          icon={<FiKey className="h-4 w-4" aria-hidden="true" />}
        >
          Đổi mật khẩu
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={logoutAll.isPending}
          onClick={() => logoutAll.mutate()}
          icon={<FiLogOut className="h-4 w-4" aria-hidden="true" />}
        >
          {logoutAll.isPending
            ? "Đang đăng xuất…"
            : "Đăng xuất khỏi mọi thiết bị"}
        </Button>
      </div>
    </BentoCard>
  );
}
