import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  FiCalendar,
  FiClock,
  FiList,
  FiMapPin,
  FiUsers,
  FiWatch,
  FiWifi,
} from "react-icons/fi";
import {
  ACTIVITY_STATUS_LABELS,
  formatDateTime,
  seatsText,
} from "@/lib/activities";
import { getActivity } from "@/lib/activityApi";
import ManageActions from "../../../_components/activities/ManageActions";
import RegisterControls from "../../../_components/activities/RegisterControls";
import IconStat from "../../../_components/IconStat";
import { mutedText, panel, tagChip } from "../../../_components/ui";

async function ActivityContent({
  params,
}: {
  params: PageProps<"/activities/[id]">["params"];
}) {
  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) {
    notFound();
  }
  const place = [activity.location, activity.address, activity.city]
    .filter(Boolean)
    .join(", ");

  return (
    <article className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start gap-2">
          <h1 className="min-w-0 flex-1 basis-56 text-2xl font-extrabold tracking-tight break-words">
            {activity.title}
          </h1>
          <span className={`${tagChip} shrink-0`}>
            {ACTIVITY_STATUS_LABELS[activity.status]}
          </span>
        </div>
        <Link
          href={`/organizations/${activity.organization_slug}`}
          className="w-fit text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
        >
          {activity.organization_name}
        </Link>
      </header>

      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {activity.start_at ? (
          <IconStat icon={FiCalendar} label="Thời gian">
            {formatDateTime(activity.start_at)}
            {activity.end_at ? ` – ${formatDateTime(activity.end_at)}` : ""}
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
        {activity.waitlist_count > 0 ? (
          <IconStat icon={FiList} label="Danh sách chờ">
            {activity.waitlist_count}
          </IconStat>
        ) : null}
        {activity.hours_awarded !== null ? (
          <IconStat icon={FiClock} label="Giờ tình nguyện">
            {activity.hours_awarded}h
          </IconStat>
        ) : null}
        {activity.registration_deadline ? (
          <IconStat icon={FiWatch} label="Hạn đăng ký">
            {formatDateTime(activity.registration_deadline)}
          </IconStat>
        ) : null}
      </div>

      {activity.description ? (
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
          {activity.description}
        </p>
      ) : null}

      <RegisterControls activity={activity} />

      {activity.viewer.can_manage ? (
        <ManageActions activity={activity} />
      ) : null}
    </article>
  );
}

export default function ActivityPage({
  params,
}: PageProps<"/activities/[id]">) {
  return (
    <Suspense fallback={<p className={mutedText}>Đang tải…</p>}>
      <ActivityContent params={params} />
    </Suspense>
  );
}
