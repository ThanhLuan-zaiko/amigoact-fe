import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BsQrCode } from "react-icons/bs";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiEdit3,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  deleteRecord,
  markAttended,
  verifyRecord,
} from "@/app/_actions/attendance";
import { formatDateTime } from "@/lib/activities";
import { getActivity } from "@/lib/activityApi";
import type { RosterEntry } from "@/lib/attendance";
import { getRoster } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/organizations";
import EmptyState from "../../../../../_components/EmptyState";
import IconStat from "../../../../../_components/IconStat";
import ActionButton from "../../../../../_components/organizations/ActionButton";
import {
  iconButton,
  mutedText,
  panel,
  primaryButton,
  sectionTitle,
  tagChip,
} from "../../../../../_components/ui";

export const metadata: Metadata = { title: "Danh sách điểm danh | AmigoACT" };

function RosterActions({
  sessionId,
  entry,
}: {
  sessionId: string;
  entry: RosterEntry;
}) {
  if (!entry.record_id) {
    return (
      <ActionButton
        action={markAttended.bind(null, sessionId, entry.registration_id)}
        label="Điểm danh hộ"
      >
        <FiUserCheck aria-hidden="true" />
      </ActionButton>
    );
  }
  return (
    <div className="flex flex-wrap items-start gap-2">
      {entry.verified ? null : (
        <ActionButton
          action={verifyRecord.bind(null, entry.record_id)}
          label="Xác nhận"
          className={primaryButton}
        >
          <FiCheck aria-hidden="true" />
        </ActionButton>
      )}
      <ActionButton
        action={deleteRecord.bind(null, entry.record_id)}
        label={entry.verified ? "Bỏ điểm danh" : "Từ chối mã"}
        confirmLabel={entry.verified ? "Bỏ điểm danh?" : "Từ chối mã?"}
      >
        <FiX aria-hidden="true" />
      </ActionButton>
    </div>
  );
}

async function RosterContent({
  params,
}: {
  params: PageProps<"/activities/[id]/attendance/[sessionId]">["params"];
}) {
  const { id, sessionId } = await params;
  await requireUser(`/activities/${id}/attendance/${sessionId}`);
  const [activity, roster] = await Promise.all([
    getActivity(id),
    getRoster(sessionId),
  ]);
  if (!activity || !roster) {
    return <p className={mutedText}>Chỉ ban quản trị mới xem được.</p>;
  }
  const editable = activity.status === "published";
  const present = roster.filter((entry) => entry.verified).length;
  const pending = roster.filter(
    (entry) => entry.record_id && !entry.verified,
  ).length;

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={`/activities/${id}/attendance`}
          aria-label="Quay lại"
          title="Quay lại"
          className={iconButton}
        >
          <FiArrowLeft aria-hidden="true" />
        </Link>
        <h1 className="min-w-0 truncate text-2xl font-extrabold tracking-tight">
          {activity.title}
        </h1>
      </div>
      {/* The summary on the left stays in view, the roster scrolls on the right, on wide screens. */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <section
          className={`${panel} flex flex-col gap-3 p-4 sm:p-6 xl:sticky xl:top-24`}
        >
          <h2 className={sectionTitle}>Tổng quan</h2>
          <IconStat icon={FiUsers} label="Đã duyệt">
            {roster.length}
          </IconStat>
          <IconStat icon={FiUserCheck} label="Có mặt">
            {present}
          </IconStat>
          <IconStat icon={FiClock} label="Chờ xác nhận">
            {pending}
          </IconStat>
        </section>
        <div className="flex min-w-0 flex-col gap-4">
          {roster.length === 0 ? (
            <EmptyState
              title="Chưa có người đăng ký được duyệt"
              description="Người đăng ký được duyệt sẽ hiện ở đây."
            />
          ) : (
            <ul
              className={`${panel} flex flex-col divide-y divide-slate-200 px-4 dark:divide-slate-800`}
            >
              {roster.map((entry) => (
                <li
                  key={entry.registration_id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                    {initials(entry.full_name)}
                  </div>
                  <div className="flex min-w-0 flex-1 basis-32 flex-col gap-1">
                    <p className="truncate text-sm font-semibold">
                      {entry.full_name}
                    </p>
                    {entry.scanned_at ? (
                      <IconStat
                        icon={entry.method === "qr" ? BsQrCode : FiEdit3}
                        label={entry.method === "qr" ? "Quét QR" : "Nhập tay"}
                      >
                        {formatDateTime(entry.scanned_at)}
                      </IconStat>
                    ) : null}
                  </div>
                  {entry.record_id && !entry.verified ? (
                    <span className={`${tagChip} gap-1`}>
                      <FiClock aria-hidden="true" />
                      Chờ xác nhận
                    </span>
                  ) : null}
                  {entry.verified ? (
                    <span className={`${tagChip} gap-1`}>
                      <FiCheck aria-hidden="true" />
                      Có mặt
                    </span>
                  ) : null}
                  {editable ? (
                    <RosterActions sessionId={sessionId} entry={entry} />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default function RosterPage({
  params,
}: PageProps<"/activities/[id]/attendance/[sessionId]">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <RosterContent params={params} />
      </Suspense>
    </div>
  );
}
