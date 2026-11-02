import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiArrowLeft, FiCalendar, FiCheck, FiX } from "react-icons/fi";
import {
  approveRegistration,
  rejectRegistration,
} from "@/app/_actions/activities";
import {
  formatDateTime,
  REGISTRATION_STATUS_LABELS,
  type RegistrationStatus,
} from "@/lib/activities";
import { getActivityRegistrations } from "@/lib/activityApi";
import { requireUser } from "@/lib/auth";
import { initials, parseOffset } from "@/lib/organizations";
import RegistrationBadge from "../../../../_components/activities/RegistrationBadge";
import EmptyState from "../../../../_components/EmptyState";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import PageLinks from "../../../../_components/organizations/PageLinks";
import {
  iconButton,
  mutedText,
  panel,
  primaryButton,
  segmentActive,
  segmentIdle,
  segmentItem,
  segmentList,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Người đăng ký | AmigoACT" };

const FILTERS = Object.keys(REGISTRATION_STATUS_LABELS) as RegistrationStatus[];
const ACTIVE = ["pending", "approved", "waitlisted"];

async function RegistrationList({
  params,
  searchParams,
}: PageProps<"/activities/[id]/registrations">) {
  const { id } = await params;
  const query = await searchParams;
  const status =
    typeof query.status === "string" &&
    FILTERS.includes(query.status as RegistrationStatus)
      ? query.status
      : "";
  const offset = parseOffset(query.offset);
  await requireUser(`/activities/${id}/registrations`);
  const page = await getActivityRegistrations(id, status, offset);
  if (!page) {
    return <p className={mutedText}>Chỉ ban quản trị mới xem được.</p>;
  }
  const base = `/activities/${id}/registrations`;

  return (
    <>
      <nav aria-label="Lọc theo trạng thái" className={segmentList}>
        <Link
          href={base}
          aria-current={status === "" ? "page" : undefined}
          className={`${segmentItem} ${status === "" ? segmentActive : segmentIdle}`}
        >
          Tất cả
        </Link>
        {FILTERS.map((filter) => (
          <Link
            key={filter}
            href={`${base}?status=${filter}`}
            aria-current={status === filter ? "page" : undefined}
            className={`${segmentItem} ${status === filter ? segmentActive : segmentIdle}`}
          >
            {REGISTRATION_STATUS_LABELS[filter]}
          </Link>
        ))}
      </nav>
      {page.items.length === 0 ? (
        <EmptyState
          title="Chưa có ai"
          description="Người đăng ký sẽ hiện ở đây."
        />
      ) : (
        <ul
          className={`${panel} flex flex-col divide-y divide-slate-200 px-4 dark:divide-slate-800`}
        >
          {page.items.map((registration) => (
            <li
              key={registration.id}
              className="flex flex-wrap items-center gap-3 py-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {initials(registration.full_name)}
              </div>
              <div className="flex min-w-0 flex-1 basis-40 flex-col gap-1">
                <p className="truncate text-sm font-semibold">
                  {registration.full_name}
                </p>
                <IconStat icon={FiCalendar} label="Ngày đăng ký">
                  {formatDateTime(registration.registered_at)}
                  {registration.shift_title
                    ? ` · ${registration.shift_title}`
                    : ""}
                </IconStat>
                {registration.note ? (
                  <p className="text-sm break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {registration.note}
                  </p>
                ) : null}
              </div>
              <RegistrationBadge status={registration.status} />
              {registration.status === "pending" ? (
                <ActionButton
                  action={approveRegistration.bind(null, registration.id)}
                  label="Duyệt"
                  className={primaryButton}
                >
                  <FiCheck aria-hidden="true" />
                </ActionButton>
              ) : null}
              {ACTIVE.includes(registration.status) ? (
                <ActionButton
                  action={rejectRegistration.bind(null, registration.id)}
                  label="Từ chối"
                  confirmLabel="Từ chối?"
                >
                  <FiX aria-hidden="true" />
                </ActionButton>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      <PageLinks
        path={status ? `${base}?status=${status}` : base}
        offset={offset}
        nextOffset={page.next_offset}
      />
    </>
  );
}

async function BackLink({
  params,
}: {
  params: PageProps<"/activities/[id]/registrations">["params"];
}) {
  const { id } = await params;
  return (
    <Link
      href={`/activities/${id}`}
      aria-label="Quay lại"
      title="Quay lại"
      className={iconButton}
    >
      <FiArrowLeft aria-hidden="true" />
    </Link>
  );
}

export default function RegistrationsPage(
  props: PageProps<"/activities/[id]/registrations">,
) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Suspense fallback={null}>
          <BackLink params={props.params} />
        </Suspense>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Người đăng ký
        </h1>
      </div>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <RegistrationList {...props} />
      </Suspense>
    </div>
  );
}
