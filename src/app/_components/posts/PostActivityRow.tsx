import Link from "next/link";
import {
  FiCalendar,
  FiChevronRight,
  FiMapPin,
  FiUserPlus,
  FiUsers,
  FiWifi,
} from "react-icons/fi";
import {
  ACTIVITY_STATUS_LABELS,
  type ActivitySummary,
  formatDateTime,
  seatsText,
} from "@/lib/activities";
import { canSignUp, isFull } from "@/lib/postActivity";
import IconStat from "../IconStat";
import { primaryButton, tagChip } from "../ui";

// The activity a post is about, as a section of the post rather than a card in a
// card. People sign up on the activity page, which checks every rule.
export default function PostActivityRow({
  activity,
}: {
  activity: ActivitySummary;
}) {
  const href = `/activities/${activity.id}`;
  const place = [activity.location, activity.city].filter(Boolean).join(", ");
  const open = canSignUp(activity);

  return (
    <section
      aria-label="Hoạt động liên quan"
      className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center dark:border-slate-800"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={href}
          className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-900 hover:text-teal-700 dark:text-slate-100 dark:hover:text-teal-400"
        >
          <FiCalendar
            aria-hidden="true"
            className="shrink-0 text-teal-700 dark:text-teal-400"
          />
          <span className="truncate">{activity.title}</span>
          <FiChevronRight aria-hidden="true" className="shrink-0" />
        </Link>
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
        </div>
      </div>
      {open ? (
        <Link
          href={href}
          className={`${primaryButton} self-start sm:self-auto`}
        >
          <FiUserPlus aria-hidden="true" />
          {isFull(activity) ? "Vào hàng chờ" : "Đăng ký"}
        </Link>
      ) : (
        <span className={`${tagChip} self-start sm:self-auto`}>
          {activity.status === "published"
            ? "Đã đóng đăng ký"
            : ACTIVITY_STATUS_LABELS[activity.status]}
        </span>
      )}
    </section>
  );
}
