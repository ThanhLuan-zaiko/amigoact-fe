import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiCalendar, FiCamera, FiCheckCircle, FiClock, FiEdit2, FiKey, FiLoader, FiLogOut, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { useLogoutAll, useSession } from "../hooks.ts";
import { GENDER_LABELS } from "../messages.tsx";
import { ProfileEditCard } from "./ProfileEditCard.tsx";
import { useUploadAvatar } from "../../profiles/hooks.ts";

function dateLabel(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function dateTimeLabel(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" });
}

export function ProfileCard(): ReactElement {
  const session = useSession();
  const logoutAll = useLogoutAll();
  const uploadAvatar = useUploadAvatar("Đã cập nhật ảnh đại diện");
  const avatarInput = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const profile = session.data ?? null;

  if (!profile) {
    return (
      <Section>
        <EmptyState
          title="Chưa đăng nhập"
          message="Vui lòng đăng nhập để xem hồ sơ của bạn."
          actionLabel="Đăng nhập"
        />
      </Section>
    );
  }

  const dob = dateLabel(profile.date_of_birth);
  const lastLogin = dateTimeLabel(profile.last_login_at);
  const gender = profile.gender ? (GENDER_LABELS[profile.gender] ?? profile.gender) : "";

  return (
    <Section>
      <div className="@container overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="h-28 bg-zinc-100 @md:h-36 dark:bg-zinc-900" />
        <div className="px-4 pb-4">
          <div className="-mt-12 flex items-end justify-between gap-3">
            <div className="relative shrink-0 rounded-full bg-white dark:bg-zinc-950">
              <Avatar name={profile.full_name} src={profile.avatar_url} size="xl" />
              <button
                type="button"
                disabled={uploadAvatar.isPending}
                onClick={() => avatarInput.current?.click()}
                aria-label="Đổi ảnh đại diện"
                title="Đổi ảnh đại diện"
                className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 dark:border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300 dark:focus-visible:outline-zinc-100"
              >
                {uploadAvatar.isPending ? (
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FiCamera className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <input
                ref={avatarInput}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Chọn ảnh đại diện"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) uploadAvatar.mutate(file);
                }}
              />
            </div>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            {profile.full_name}
          </h1>
          <p
            className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              profile.email_verified
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
            }`}
          >
            <FiCheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {profile.email_verified ? "Email đã xác minh" : "Email chưa xác minh"}
          </p>
        </div>
      </div>
      {editing ? (
        <ProfileEditCard profile={profile} onDone={() => setEditing(false)} />
      ) : (
        <>
          <dl className="@container mt-4 grid gap-2 text-sm @md:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
              <FiMail className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <dt className="sr-only">Email</dt>
              <dd className="truncate text-zinc-900 dark:text-zinc-100">{profile.email}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
              <FiPhone className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <dt className="sr-only">Số điện thoại</dt>
              <dd className="truncate text-zinc-900 dark:text-zinc-100">{profile.phone}</dd>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
              <FiUser className="h-4 w-4 text-zinc-400" aria-hidden="true" />
              <dt className="sr-only">Họ và tên</dt>
              <dd className="truncate text-zinc-900 dark:text-zinc-100">{profile.full_name}</dd>
            </div>
            {dob && (
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                <FiCalendar className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Ngày sinh</dt>
                <dd className="truncate text-zinc-900 dark:text-zinc-100">{dob}</dd>
              </div>
            )}
            {gender && gender !== "Không nêu" && (
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                <FiUser className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Giới tính</dt>
                <dd className="truncate text-zinc-900 dark:text-zinc-100">{gender}</dd>
              </div>
            )}
            {profile.address && (
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                <FiMapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Địa chỉ</dt>
                <dd className="truncate text-zinc-900 dark:text-zinc-100">{profile.address}</dd>
              </div>
            )}
            {lastLogin && (
              <div className="flex min-w-0 items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
                <FiClock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Đăng nhập gần nhất</dt>
                <dd className="truncate text-zinc-900 dark:text-zinc-100">{`Đăng nhập gần nhất: ${lastLogin}`}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={() => setEditing(true)}
              icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
            >
              Chỉnh sửa hồ sơ
            </Button>
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
        </>
      )}
    </Section>
  );
}
