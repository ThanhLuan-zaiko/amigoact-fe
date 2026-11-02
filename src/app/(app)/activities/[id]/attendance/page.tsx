import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiList,
  FiLock,
} from "react-icons/fi";
import { closeSession } from "@/app/_actions/attendance";
import { formatDateTime } from "@/lib/activities";
import { getActivity } from "@/lib/activityApi";
import { type AttendanceSession, checkInUrl } from "@/lib/attendance";
import { getSessions } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import OpenSessionForm from "../../../../_components/attendance/OpenSessionForm";
import SessionQr from "../../../../_components/attendance/SessionQr";
import EmptyState from "../../../../_components/EmptyState";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import { iconButton, mutedText, panel } from "../../../../_components/ui";

export const metadata: Metadata = { title: "Điểm danh | AmigoACT" };

async function requestOrigin(): Promise<string> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "";
  const protocol = incoming.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function SessionCard({
  activityId,
  session,
  origin,
}: {
  activityId: string;
  session: AttendanceSession;
  origin: string;
}) {
  return (
    <li className={`${panel} flex flex-wrap items-start gap-4 p-4`}>
      {session.is_open && session.qr_token ? (
        <SessionQr
          url={checkInUrl(process.env.APP_URL, origin, session.qr_token)}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 basis-48 flex-col gap-2">
        {session.shift_title ? (
          <p className="font-semibold">{session.shift_title}</p>
        ) : null}
        {session.manual_code ? (
          <p className="font-mono text-3xl font-extrabold tracking-widest">
            <span className="sr-only">Mã nhập tay: </span>
            {session.manual_code}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <IconStat icon={FiClock} label="Đóng lúc">
            {formatDateTime(session.closes_at)}
          </IconStat>
          <IconStat icon={FiCheckCircle} label="Đã điểm danh">
            {session.checked_in_count}
          </IconStat>
          {session.pending_count > 0 ? (
            <IconStat icon={FiList} label="Mã nhập tay chờ xác nhận">
              {session.pending_count}
            </IconStat>
          ) : null}
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Link
            href={`/activities/${activityId}/attendance/${session.id}`}
            aria-label="Danh sách điểm danh"
            title="Danh sách điểm danh"
            className={iconButton}
          >
            <FiList aria-hidden="true" />
          </Link>
          {session.is_open ? (
            <ActionButton
              action={closeSession.bind(null, session.id)}
              label="Đóng phiên"
              confirmLabel="Đóng phiên này?"
            >
              <FiLock aria-hidden="true" />
            </ActionButton>
          ) : null}
        </div>
      </div>
    </li>
  );
}

async function AttendanceContent({
  params,
}: {
  params: PageProps<"/activities/[id]/attendance">["params"];
}) {
  const { id } = await params;
  await requireUser(`/activities/${id}/attendance`);
  const [activity, sessions] = await Promise.all([
    getActivity(id),
    getSessions(id),
  ]);
  if (!activity || !sessions) {
    return <p className={mutedText}>Chỉ ban quản trị mới xem được.</p>;
  }
  const origin = await requestOrigin();

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href={`/activities/${id}`}
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
      {activity.status === "published" ? (
        <OpenSessionForm activityId={id} shifts={activity.shifts} />
      ) : null}
      {sessions.length === 0 ? (
        <EmptyState
          title="Chưa có phiên điểm danh"
          description="Mở phiên để có mã QR và mã nhập tay."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              activityId={id}
              session={session}
              origin={origin}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export default function AttendancePage({
  params,
}: PageProps<"/activities/[id]/attendance">) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <AttendanceContent params={params} />
      </Suspense>
    </div>
  );
}
