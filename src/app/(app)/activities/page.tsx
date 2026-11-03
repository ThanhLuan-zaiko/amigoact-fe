import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BsQrCode } from "react-icons/bs";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiCompass,
  FiFlag,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { cancelRegistration } from "@/app/_actions/activities";
import { formatDateTime } from "@/lib/activities";
import { getMyRegistrations } from "@/lib/activityApi";
import { APPEAL_STATUS_LABELS } from "@/lib/attendance";
import { requireUser } from "@/lib/auth";
import RegistrationBadge from "../../_components/activities/RegistrationBadge";
import AppealButton from "../../_components/attendance/AppealButton";
import EmptyState from "../../_components/EmptyState";
import IconStat from "../../_components/IconStat";
import ActionButton from "../../_components/organizations/ActionButton";
import {
  iconButton,
  mutedText,
  panel,
  primaryButton,
  splitList,
  splitRow,
  tagChip,
} from "../../_components/ui";

export const metadata: Metadata = { title: "Hoạt động | AmigoACT" };

async function MyActivities() {
  await requireUser("/activities");
  const registrations = await getMyRegistrations();
  if (registrations.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <div className="w-full">
          <EmptyState
            title="Bạn chưa đăng ký hoạt động nào"
            description="Các hoạt động bạn đăng ký sẽ hiện ở đây."
          />
        </div>
        <Link href="/explore" className={primaryButton}>
          <FiCompass aria-hidden="true" />
          Khám phá
        </Link>
      </div>
    );
  }
  return (
    <ul className={`${panel} ${splitList} px-4`}>
      {registrations.map((registration) => (
        <li
          key={registration.id}
          className={`flex flex-wrap items-center gap-3 py-3 ${splitRow}`}
        >
          <div className="flex min-w-0 flex-1 basis-56 flex-col gap-1">
            <Link
              href={`/activities/${registration.activity_id}`}
              className="font-semibold break-words transition-colors hover:text-teal-700 dark:hover:text-teal-400"
            >
              {registration.activity_title}
            </Link>
            <p className={`${mutedText} truncate`}>
              {registration.organization_name}
              {registration.shift_title ? ` · ${registration.shift_title}` : ""}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <IconStat icon={FiCalendar} label="Thời gian">
                {formatDateTime(registration.start_at)}
              </IconStat>
              {registration.location ? (
                <IconStat icon={FiMapPin} label="Địa điểm">
                  {registration.location}
                </IconStat>
              ) : null}
            </div>
          </div>
          <RegistrationBadge
            status={registration.status}
            waitlistPosition={registration.waitlist_position}
          />
          {registration.attendance === "pending" ? (
            <span className={`${tagChip} gap-1`}>
              <BsQrCode aria-hidden="true" />
              Chờ xác nhận
            </span>
          ) : null}
          {registration.attendance === "verified" &&
          registration.status !== "attended" ? (
            <span className={`${tagChip} gap-1`}>
              <FiCheck aria-hidden="true" />
              Có mặt
            </span>
          ) : null}
          {registration.appeal_status ? (
            <span className={`${tagChip} gap-1`}>
              <FiFlag aria-hidden="true" />
              {APPEAL_STATUS_LABELS[registration.appeal_status]}
            </span>
          ) : null}
          {registration.can_appeal ? (
            <AppealButton registrationId={registration.id} />
          ) : null}
          {registration.can_cancel ? (
            <ActionButton
              action={cancelRegistration.bind(null, registration.id)}
              label="Hủy đăng ký"
              confirmLabel="Hủy đăng ký?"
            >
              <FiX aria-hidden="true" />
            </ActionButton>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="min-w-0 flex-1 text-2xl font-extrabold tracking-tight">
          Hoạt động
        </h1>
        <Link
          href="/hours"
          aria-label="Giờ tình nguyện"
          title="Giờ tình nguyện"
          className={iconButton}
        >
          <FiClock aria-hidden="true" />
        </Link>
        <Link href="/checkin" className={primaryButton}>
          <BsQrCode aria-hidden="true" />
          Điểm danh
        </Link>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <MyActivities />
      </Suspense>
    </div>
  );
}
