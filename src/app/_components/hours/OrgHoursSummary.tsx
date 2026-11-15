import {
  FiAward,
  FiClock,
  FiEdit2,
  FiFlag,
  FiPlusCircle,
  FiUsers,
} from "react-icons/fi";
import { hoursText } from "@/lib/attendance";
import { type OrgHourStats, roundHours } from "@/lib/hoursStats";
import IconStat from "../IconStat";
import { mutedText, panel, sectionTitle, stickySide } from "../ui";
import AttendanceRate from "./AttendanceRate";
import TermChips from "./TermChips";

// The secondary column of an organization's hours: totals, attendance, top volunteers.
export default function OrgHoursSummary({ stats }: { stats: OrgHourStats }) {
  const { totals } = stats;
  return (
    <aside
      className={`${panel} ${stickySide} flex flex-col divide-y divide-slate-200 dark:divide-slate-800`}
    >
      <section className="flex flex-col gap-3 p-4 sm:p-6">
        <p className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
          <FiClock aria-hidden="true" className="text-slate-500" />
          <span className="sr-only">Tổng giờ: </span>
          {hoursText(roundHours(totals.total))}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <IconStat icon={FiPlusCircle} label="Giờ được ghi">
            {hoursText(roundHours(totals.awarded))}
          </IconStat>
          <IconStat icon={FiEdit2} label="Giờ điều chỉnh, số lần">
            {hoursText(roundHours(totals.adjusted), { signed: true })} ·{" "}
            {totals.adjustments}
          </IconStat>
          <IconStat icon={FiFlag} label="Số hoạt động">
            {totals.activities}
          </IconStat>
          <IconStat icon={FiUsers} label="Số tình nguyện viên">
            {totals.volunteers}
          </IconStat>
        </div>
      </section>
      <AttendanceRate attendance={stats.attendance} />
      <section className="flex flex-col gap-2 p-4 sm:p-6">
        <h2 className={`${sectionTitle} flex items-center gap-2`}>
          <FiAward aria-hidden="true" />
          Nhiều giờ nhất
        </h2>
        {stats.top_volunteers.length === 0 ? (
          <p className={mutedText}>Chưa có giờ trong khoảng này.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
            {stats.top_volunteers.map((person, index) => (
              <li key={person.user_id} className="flex items-center gap-3 py-2">
                <span className={`${mutedText} w-5 shrink-0 tabular-nums`}>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {person.full_name}
                </span>
                <span className="shrink-0 font-semibold">
                  {hoursText(roundHours(person.hours))}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
      <TermChips terms={stats.by_term} />
    </aside>
  );
}
