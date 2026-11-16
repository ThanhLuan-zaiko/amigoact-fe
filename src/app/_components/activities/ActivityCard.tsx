import Link from "next/link";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiWifi } from "react-icons/fi";
import {
  ACTIVITY_STATUS_LABELS,
  type ActivitySummary,
  formatDateTime,
  seatsText,
} from "@/lib/activities";
import { activityTagHref } from "@/lib/activityList";
import { focusClass } from "@/lib/focus";
import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";
import IconStat from "../IconStat";
import { mutedText, panel, tagChip, tagLink } from "../ui";

type ActivityCardProps = {
  activity: ActivitySummary;
  // The viewer's zone, from viewerTimeZone().
  timeZone: string;
};

// The title link covers the whole card, so the card opens the activity. Tag chips
// sit above that cover and lead to the activities with the same tag, because a
// link inside a link is not valid HTML. A picture borrowed from a public post (or the
// organization cover) leads the card when the list has one.
export default function ActivityCard({
  activity,
  timeZone,
}: ActivityCardProps) {
  const place = [activity.location, activity.city].filter(Boolean).join(", ");
  const tags = activity.tags ?? [];
  const picture = activity.picture;

  return (
    <article
      className={`${panel} relative flex w-full min-w-0 flex-col overflow-hidden transition-colors focus-within:border-teal-700 hover:border-teal-700 dark:focus-within:border-teal-400 dark:hover:border-teal-400`}
    >
      {picture ? (
        // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
        <img
          src={sizedSrc(picture.url, 640)}
          srcSet={srcSetFor(picture.url)}
          sizes="(min-width: 768px) 720px, 100vw"
          alt=""
          loading="lazy"
          className={`aspect-video w-full object-cover ${focusClass(picture.focus)}`}
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-2 p-4">
        <div className="flex items-start gap-2">
          <Link
            href={`/activities/${activity.id}`}
            className="min-w-0 flex-1 font-semibold break-words outline-none after:absolute after:inset-0 after:rounded-lg"
          >
            {activity.title}
          </Link>
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
              {formatDateTime(activity.start_at, timeZone)}
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
        {tags.length > 0 ? (
          <div className="relative z-10 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={activityTagHref(activity.organization_slug, tag)}
                title="Xem hoạt động cùng thẻ"
                className={tagLink}
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
