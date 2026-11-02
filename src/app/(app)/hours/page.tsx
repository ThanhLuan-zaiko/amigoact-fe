import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiCalendar, FiClock, FiEdit2 } from "react-icons/fi";
import { hoursText } from "@/lib/attendance";
import { getMyHours } from "@/lib/attendanceApi";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/organizations";
import EmptyState from "../../_components/EmptyState";
import IconStat from "../../_components/IconStat";
import { mutedText, panel, tagChip } from "../../_components/ui";

export const metadata: Metadata = { title: "Giờ tình nguyện | AmigoACT" };

async function HoursContent() {
  await requireUser("/hours");
  const hours = await getMyHours();
  if (!hours) {
    return (
      <p className={mutedText}>Không tải được dữ liệu. Vui lòng thử lại.</p>
    );
  }
  return (
    <>
      <section
        className={`${panel} flex flex-wrap items-center gap-4 p-4 sm:p-6`}
      >
        <p className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <FiClock aria-hidden="true" className="text-slate-500" />
          <span className="sr-only">Tổng giờ: </span>
          {hoursText(hours.total)}
        </p>
        <div className="flex flex-wrap gap-2">
          {hours.by_term.map(({ term, hours: termHours }) => (
            <span key={term} className={tagChip}>
              {term}: {hoursText(termHours)}
            </span>
          ))}
        </div>
      </section>
      {hours.entries.length === 0 ? (
        <EmptyState
          title="Chưa có giờ nào"
          description="Giờ được ghi khi hoạt động kết thúc và bạn đã điểm danh."
        />
      ) : (
        <ul
          className={`${panel} flex flex-col divide-y divide-slate-200 px-4 dark:divide-slate-800`}
        >
          {hours.entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-3 py-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {entry.activity_id ? (
                  <Link
                    href={`/activities/${entry.activity_id}`}
                    className="font-semibold break-words transition-colors hover:text-teal-700 dark:hover:text-teal-400"
                  >
                    {entry.activity_title}
                  </Link>
                ) : (
                  <p className="font-semibold">{entry.organization_name}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <IconStat icon={FiCalendar} label="Ngày ghi">
                    {formatDate(entry.recorded_at)}
                  </IconStat>
                  {entry.source === "adjustment" ? (
                    <IconStat icon={FiEdit2} label="Điều chỉnh">
                      {entry.note}
                    </IconStat>
                  ) : null}
                </div>
              </div>
              <span className="shrink-0 font-bold">
                {hoursText(entry.hours, { signed: true })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function HoursPage() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight">
        Giờ tình nguyện
      </h1>
      <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
        <HoursContent />
      </Suspense>
    </div>
  );
}
