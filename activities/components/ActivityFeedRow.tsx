import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../core/components/Avatar.tsx";
import { formatDateTime } from "../dates.tsx";
import type { MyActivityItem, MyActivityOrg } from "../feed-api.ts";
import { placeLine } from "../place.tsx";
import { StatusChip } from "./ActivityCard.tsx";
import { ActivityRowMenu } from "./ActivityRowMenu.tsx";

const MONTH = new Intl.DateTimeFormat("vi-VN", { month: "short" });

// Day-and-month tile. The row's meta line carries the full date for screen
// readers, so the tile is decorative.
function DateTile({ value }: { value: string | null }): ReactElement {
  const date = value === null ? null : new Date(value);
  return (
    <span
      aria-hidden="true"
      className="flex w-12 shrink-0 flex-col items-center rounded-xl border border-zinc-200 py-1 dark:border-zinc-800"
    >
      <span className="text-lg leading-6 font-bold text-zinc-900 dark:text-zinc-100">
        {date === null ? "-" : date.getDate()}
      </span>
      <span className="text-[10px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {date === null ? "" : MONTH.format(date)}
      </span>
    </span>
  );
}

// One activity in the cross-org feed, labelled with its organization.
export function ActivityFeedRow({
  item,
  org,
}: {
  item: MyActivityItem;
  org: MyActivityOrg | undefined;
}): ReactElement {
  const place = placeLine(item);
  const when = formatDateTime(item.start_at);
  const meta = place === null ? when : `${when} · ${place}`;
  const orgName = org?.name ?? "";
  return (
    <li className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
      <DateTile value={item.start_at} />
      <div className="min-w-0 flex-1">
        <Link
          to={`/manage/events/${item.org_id}/${item.id}`}
          className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-100 dark:focus-visible:outline-zinc-400"
        >
          <span className="truncate text-[15px] font-semibold">
            {item.title}
          </span>
          <StatusChip status={item.status} />
        </Link>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {meta}
        </p>
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300">
          <Avatar name={orgName} src={org?.logo_url ?? null} size="xs" />
          <span className="truncate">{orgName}</span>
        </p>
        {item.tags.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            {item.tags.slice(0, 3).map((tag) => (
              <li
                key={tag.slug}
                className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800"
              >
                #{tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {item.can_manage && <ActivityRowMenu activity={item} />}
    </li>
  );
}
