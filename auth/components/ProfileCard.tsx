import { useState } from "react";
import type { ReactElement } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiEdit2, FiKey, FiLogOut, FiMail, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import { useLogoutAll, useSession } from "../hooks.ts";
import { GENDER_LABELS } from "../messages.tsx";
import { ProfileEditCard } from "./ProfileEditCard.tsx";

function initialOf(name: string): string {
  const first = name.trim().charAt(0);
  return first ? first.toUpperCase() : "?";
}

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
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 text-lg font-semibold text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950"
        >
          {initialOf(profile.full_name)}
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            {profile.full_name}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <FiCheckCircle
              className="h-4 w-4 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            {profile.email_verified
              ? "Email đã xác minh"
              : "Email chưa xác minh"}
          </p>
        </div>
      </div>
      {editing ? (
        <ProfileEditCard profile={profile} onDone={() => setEditing(false)} />
      ) : (
        <>
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
            {dob && (
              <div className="flex items-center gap-2">
                <FiCalendar className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Ngày sinh</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{dob}</dd>
              </div>
            )}
            {gender && gender !== "Không nêu" && (
              <div className="flex items-center gap-2">
                <FiUser className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Giới tính</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{gender}</dd>
              </div>
            )}
            {profile.address && (
              <div className="flex items-center gap-2">
                <FiMapPin className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Địa chỉ</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{profile.address}</dd>
              </div>
            )}
            {lastLogin && (
              <div className="flex items-center gap-2">
                <FiClock className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                <dt className="sr-only">Đăng nhập gần nhất</dt>
                <dd className="text-zinc-900 dark:text-zinc-100">{`Đăng nhập gần nhất: ${lastLogin}`}</dd>
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
