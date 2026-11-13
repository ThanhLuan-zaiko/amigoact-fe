import type { Metadata } from "next";
import { Suspense } from "react";
import { FiCalendar, FiCheck, FiClock, FiList, FiX } from "react-icons/fi";
import { approveAppeal, rejectAppeal } from "@/app/_actions/attendance";
import { getActivity } from "@/lib/activityApi";
import { APPEAL_STATUS_LABELS } from "@/lib/attendance";
import { getAppeals } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/organizations";
import BackLink from "../../../../_components/BackLink";
import EmptyState from "../../../../_components/EmptyState";
import IconStat from "../../../../_components/IconStat";
import ActionButton from "../../../../_components/organizations/ActionButton";
import {
  mutedText,
  panel,
  primaryButton,
  sectionTitle,
  tagChip,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Khiếu nại | AmigoACT" };

async function AppealsContent({
  params,
}: {
  params: PageProps<"/activities/[id]/appeals">["params"];
}) {
  const { id } = await params;
  await requireUser(`/activities/${id}/appeals`);
  const [activity, appeals] = await Promise.all([
    getActivity(id),
    getAppeals(id),
  ]);
  if (!activity || !appeals) {
    return <p className={mutedText}>Chỉ ban quản trị mới xem được.</p>;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <BackLink href={`/activities/${id}`} />
        <h1 className="min-w-0 truncate text-2xl font-extrabold tracking-tight">
          Khiếu nại
        </h1>
      </div>
      {/* The counts on the left, the appeals on the right, on wide screens. */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <section
          className={`${panel} flex flex-col gap-3 p-4 xl:sticky xl:top-24`}
        >
          <h2 className={sectionTitle}>Tổng quan</h2>
          <IconStat icon={FiList} label="Tổng số">
            {appeals.length}
          </IconStat>
          <IconStat icon={FiClock} label="Đang chờ">
            {appeals.filter((appeal) => appeal.status === "pending").length}
          </IconStat>
        </section>
        <div className="flex min-w-0 flex-col gap-4">
          {appeals.length === 0 ? (
            <EmptyState
              title="Không có khiếu nại nào"
              description="Khiếu nại về điểm danh sẽ hiện ở đây."
            />
          ) : (
            <ul
              className={`${panel} flex flex-col divide-y divide-slate-200 px-4 dark:divide-slate-800`}
            >
              {appeals.map((appeal) => (
                <li key={appeal.id} className="flex flex-col gap-2 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {appeal.full_name}
                    </p>
                    <IconStat icon={FiCalendar} label="Ngày gửi">
                      {formatDate(appeal.created_at)}
                    </IconStat>
                    <span className={tagChip}>
                      {APPEAL_STATUS_LABELS[appeal.status]}
                    </span>
                  </div>
                  <p className="text-sm break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
                    {appeal.reason}
                  </p>
                  {appeal.status === "pending" ? (
                    <div className="flex flex-wrap items-start gap-2">
                      {appeal.registrations.map((registration) => (
                        <ActionButton
                          key={registration.registration_id}
                          action={approveAppeal.bind(
                            null,
                            appeal.id,
                            registration.registration_id,
                          )}
                          label="Chấp nhận"
                          className={primaryButton}
                        >
                          <FiCheck aria-hidden="true" />
                          {registration.shift_title}
                        </ActionButton>
                      ))}
                      <ActionButton
                        action={rejectAppeal.bind(null, appeal.id)}
                        label="Từ chối"
                        confirmLabel="Từ chối khiếu nại?"
                      >
                        <FiX aria-hidden="true" />
                      </ActionButton>
                    </div>
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

export default function AppealsPage({
  params,
}: PageProps<"/activities/[id]/appeals">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <AppealsContent params={params} />
      </Suspense>
    </div>
  );
}
