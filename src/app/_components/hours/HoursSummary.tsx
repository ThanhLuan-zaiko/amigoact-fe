import {
  FiClock,
  FiEdit2,
  FiFlag,
  FiPlusCircle,
  FiUsers,
} from "react-icons/fi";
import { hoursText } from "@/lib/attendance";
import { type MyHourStats, roundHours } from "@/lib/hoursStats";
import IconStat from "../IconStat";
import { panel, stickySide } from "../ui";
import AttendanceRate from "./AttendanceRate";
import TermChips from "./TermChips";

// The short secondary column: totals for the chosen range, attendance, and terms.
export default function HoursSummary({ stats }: { stats: MyHourStats }) {
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
          <IconStat icon={FiEdit2} label="Giờ điều chỉnh">
            {hoursText(roundHours(totals.adjusted), { signed: true })}
          </IconStat>
          <IconStat icon={FiFlag} label="Số hoạt động">
            {totals.activities}
          </IconStat>
          <IconStat icon={FiUsers} label="Số tổ chức">
            {totals.organizations}
          </IconStat>
        </div>
      </section>
      <AttendanceRate attendance={stats.attendance} />
      <TermChips terms={stats.by_term} />
    </aside>
  );
}
