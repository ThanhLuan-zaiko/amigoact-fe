import Link from "next/link";
import {
  FiCalendar,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiUserPlus,
  FiUsers,
  FiWifi,
} from "react-icons/fi";
import {
  ACTIVITY_STATUS_LABELS,
  type ActivitySummary,
  formatDateTimeZoned,
  seatsText,
} from "@/lib/activities";
import { focusClass } from "@/lib/focus";
import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";
import { canSignUp, isFull, seatWidthClass } from "@/lib/postActivity";
import IconStat from "../IconStat";
import { mutedText, primaryButton, tagChip } from "../ui";

type PostActivityPanelProps = {
  activity: ActivitySummary;
  // Pictures already shown in the post, so the panel does not repeat one.
  postPictureUrls: string[];
  timeZone: string;
};

// The "Hoạt động" tab beside a post: what the activity is, when and where,
// how full it is, and the way to sign up. The activity page checks every rule.
export default function PostActivityPanel({
  activity,
  postPictureUrls,
  timeZone,
}: PostActivityPanelProps) {
  const href = `/activities/${activity.id}`;
  const place = [activity.location, activity.city].filter(Boolean).join(", ");
  const open = canSignUp(activity);
  const bar = seatWidthClass(activity.seats_taken, activity.capacity);
  const picture =
    activity.picture && !postPictureUrls.includes(activity.picture.url)
      ? activity.picture
      : null;

  return (
    <div className="flex flex-col">
      {picture ? (
        // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
        <img
          src={sizedSrc(picture.url, 640)}
          srcSet={srcSetFor(picture.url)}
          sizes="(min-width: 1280px) 520px, 100vw"
          alt=""
          className={`aspect-video w-full object-cover ${focusClass(picture.focus)}`}
        />
      ) : null}
      <div className="flex flex-col gap-3 p-4">
        <Link
          href={href}
          className="text-lg font-bold break-words hover:text-teal-700 dark:hover:text-teal-400"
        >
          {activity.title}
        </Link>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {activity.start_at ? (
            <IconStat icon={FiCalendar} label="Thời gian">
              {formatDateTimeZoned(activity.start_at, timeZone)}
            </IconStat>
          ) : null}
          {activity.hours_awarded !== null ? (
            <IconStat icon={FiClock} label="Giờ tình nguyện">
              {activity.hours_awarded}h
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
        {bar ? (
          <div
            role="presentation"
            className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              className={`h-full rounded-full bg-teal-700 dark:bg-teal-400 ${bar}`}
            />
          </div>
        ) : null}
        {activity.registration_deadline ? (
          <p className={mutedText}>
            Hạn đăng ký:{" "}
            {formatDateTimeZoned(activity.registration_deadline, timeZone)}
          </p>
        ) : null}
        {open ? (
          <Link href={href} className={`${primaryButton} w-full`}>
            <FiUserPlus aria-hidden="true" />
            {isFull(activity) ? "Vào hàng chờ" : "Đăng ký"}
          </Link>
        ) : (
          <span className={`${tagChip} self-start`}>
            {activity.status === "published"
              ? "Đã đóng đăng ký"
              : ACTIVITY_STATUS_LABELS[activity.status]}
          </span>
        )}
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          Xem chi tiết hoạt động
          <FiChevronRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
