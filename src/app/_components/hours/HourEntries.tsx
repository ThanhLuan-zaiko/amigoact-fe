import Link from "next/link";
import { FiCalendar, FiEdit2, FiList } from "react-icons/fi";
import { type HourEntry, hoursText } from "@/lib/attendance";
import { formatDate } from "@/lib/organizations";
import IconStat from "../IconStat";
import { panel, sectionTitle } from "../ui";

// The latest rows of the ledger, newest first. Not filtered by the range above.
export default function HourEntries({ entries }: { entries: HourEntry[] }) {
  return (
    <section className={`${panel} flex flex-col gap-1 px-4 pt-4`}>
      <h2 className={`${sectionTitle} flex items-center gap-2`}>
        <FiList aria-hidden="true" />
        Ghi nhận gần đây
      </h2>
      <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
        {entries.map((entry) => (
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
    </section>
  );
}
