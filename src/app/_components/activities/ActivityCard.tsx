import Link from "next/link";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiWifi } from "react-icons/fi";
import {
  ACTIVITY_STATUS_LABELS,
  type ActivitySummary,
  formatDateTime,
  seatsText,
} from "@/lib/activities";
import IconStat from "../IconStat";
import { mutedText, panel, tagChip } from "../ui";

type ActivityCardProps = {
  activity: ActivitySummary;
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  const place = [activity.location, activity.city].filter(Boolean).join(", ");

  return (
    <Link
      href={`/activities/${activity.id}`}
      className={`${panel} flex min-w-0 flex-col gap-2 p-4 transition-colors hover:border-teal-700 dark:hover:border-teal-400`}
    >
      <div className="flex items-start gap-2">
        <p className="min-w-0 flex-1 font-semibold break-words">
          {activity.title}
        </p>
        {activity.status !== "published" ? (
          <span className={`${tagChip} shrink-0`}>
            {ACTIVITY_STATUS_LABELS[activity.status]}
          </span>
        ) : null}
      </div>
      <p className={`${mutedText} truncate`}>{activity.organization_name}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {activity.start_at ? (
          <IconStat icon={FiCalendar} label="Thời gian">
            {formatDateTime(activity.start_at)}
          </IconStat>
        ) : null}
        {activity.is_remote ? (
          <IconStat icon={FiWifi} label="Trực tuyến">
            Online
          </IconStat>
        ) : place ? (
          <IconStat icon={FiMapPin} label="Địa điểm">
            {place}
          </IconStat>
        ) : null}
        <IconStat icon={FiUsers} label="Số chỗ">
          {seatsText(activity.seats_taken, activity.capacity)}
        </IconStat>
        {activity.hours_awarded !== null ? (
          <IconStat icon={FiClock} label="Giờ tình nguyện">
            {activity.hours_awarded}h
          </IconStat>
        ) : null}
      </div>
    </Link>
  );
}
