import type { Metadata } from "next";
import { Suspense } from "react";
import { getActivity } from "@/lib/activityApi";
import { hoursText } from "@/lib/attendance";
import { getActivityHours } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { initials } from "@/lib/organizations";
import AdjustHours from "../../../../_components/attendance/AdjustHours";
import BackLink from "../../../../_components/BackLink";
import EmptyState from "../../../../_components/EmptyState";
import {
  mutedText,
  panel,
  splitList,
  splitRow,
} from "../../../../_components/ui";

export const metadata: Metadata = { title: "Giờ của hoạt động | AmigoACT" };

async function ActivityHoursContent({
  params,
}: {
  params: PageProps<"/activities/[id]/hours">["params"];
}) {
  const { id } = await params;
  await requireUser(`/activities/${id}/hours`);
  const [activity, entries] = await Promise.all([
    getActivity(id),
    getActivityHours(id),
  ]);
  if (!activity || !entries) {
    return <p className={mutedText}>Chỉ ban quản trị mới xem được.</p>;
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <BackLink href={`/activities/${id}`} />
        <h1 className="min-w-0 truncate text-2xl font-extrabold tracking-tight">
          {activity.title}
        </h1>
      </div>
      {entries.length === 0 ? (
        <EmptyState
          title="Chưa ghi giờ"
          description="Giờ được ghi khi hoạt động kết thúc, cho người đã điểm danh."
        />
      ) : (
        <ul className={`${panel} ${splitList} px-4`}>
          {entries.map((entry) => (
            <li
              key={entry.user_id}
              className={`flex flex-wrap items-center gap-3 py-3 ${splitRow}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
                {initials(entry.full_name)}
              </div>
              <p className="min-w-0 flex-1 basis-32 truncate text-sm font-semibold">
                {entry.full_name}
              </p>
              <span className="font-bold">{hoursText(entry.hours)}</span>
              <AdjustHours activityId={id} userId={entry.user_id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ActivityHoursPage({
  params,
}: PageProps<"/activities/[id]/hours">) {
  return (
    <div className="flex w-full flex-col gap-4">
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <ActivityHoursContent params={params} />
      </Suspense>
    </div>
  );
}
