import Link from "next/link";
import { FiCalendar, FiUsers } from "react-icons/fi";
import { formatDateTime, seatsText } from "@/lib/activities";
import { listPublicActivities } from "@/lib/activityApi";
import IconStat from "../IconStat";
import { mutedText } from "../ui";

const UPCOMING_COUNT = 4;

// Calls the backend, so the home page renders it behind a Suspense boundary.
export default async function UpcomingActivities() {
  const page = await listPublicActivities("", "", 0, UPCOMING_COUNT);
  const activities = page?.items ?? [];
  if (activities.length === 0) {
    return <p className={mutedText}>Chưa có hoạt động sắp diễn ra.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {activities.map((activity) => (
        <li key={activity.id} className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/activities/${activity.id}`}
            className="font-semibold break-words transition-colors hover:text-teal-700 dark:hover:text-teal-400"
          >
            {activity.title}
          </Link>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <IconStat icon={FiCalendar} label="Thời gian">
              {formatDateTime(activity.start_at)}
            </IconStat>
            <IconStat icon={FiUsers} label="Số chỗ">
              {seatsText(activity.seats_taken, activity.capacity)}
            </IconStat>
          </div>
        </li>
      ))}
    </ul>
  );
}
