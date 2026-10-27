import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import type { BrowseItem } from "../browse-api.ts";
import { formatEventWhen, relativeDayLabel } from "../dates.tsx";
import { placeLine } from "../place.tsx";
import { DateTile } from "./DateTile.tsx";
import { MyRegistrationChip } from "./MyRegistrationChip.tsx";
import { QuickRegisterButton } from "./QuickRegisterButton.tsx";
import { RegistrationStateChip } from "./RegistrationStateChip.tsx";
import { SeatsMeter } from "./SeatsMeter.tsx";
import { StateChip } from "./StateChip.tsx";

interface EventRowProps {
  item: BrowseItem;
  myStatus?: string;
}

// Tags shown on a row; the rest stay on the detail page.
const ROW_TAG_LIMIT = 3;
// The title link stretches over the whole row. Controls inside it lift above
// that overlay with relative z-10.
const OVERLAY_LINK =
  "after:absolute after:inset-0 after:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";
const LIFTED = "relative z-10";

// One feed row. The whole row is a target, but every control inside it works
// on its own. A cancelled event has no detail page, so its row is plain text.
export function EventRow({ item, myStatus }: EventRowProps): ReactElement {
  const place = placeLine(item);
  const cancelled = item.phase === "cancelled";
  const relative = relativeDayLabel(item.start_at);
  return (
    <li className="group relative flex gap-3 px-4 py-3 hover:bg-zinc-50 focus-within:bg-zinc-50 dark:hover:bg-zinc-900 dark:focus-within:bg-zinc-900">
      <DateTile iso={item.start_at} />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
          {cancelled ? (
            item.title
          ) : (
            <Link
              to={`/events/${item.org_id}/${item.slug}`}
              className={`${OVERLAY_LINK} group-hover:underline`}
            >
              {item.title}
            </Link>
          )}
        </h3>
        <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
          {formatEventWhen(item.start_at, item.end_at)}
          {relative !== null && (
            <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
              {relative}
            </span>
          )}
        </p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <Avatar name={item.org.name} src={item.org.logo_url} size="xs" />
          <Link
            to={`/orgs/${item.org.slug}`}
            className={`${LIFTED} min-w-0 truncate hover:underline`}
          >
            {item.org.name}
          </Link>
          {item.org.verified && (
            <StateChip tone="emerald">Đã xác minh</StateChip>
          )}
        </p>
        {place !== null && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <FiMapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{place}</span>
          </p>
        )}
        {item.excerpt && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {item.excerpt}
          </p>
        )}
        {item.tags.length > 0 && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {item.tags.slice(0, ROW_TAG_LIMIT).map((tag) => (
              <li key={tag.slug}>
                <Link
                  to={`/events?tag=${tag.slug}`}
                  className={`${LIFTED} inline-flex rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400`}
                >
                  #{tag.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {myStatus !== undefined && <MyRegistrationChip status={myStatus} />}
          {cancelled ? (
            <StateChip tone="zinc">Đã hủy</StateChip>
          ) : (
            <RegistrationStateChip
              open={item.registration_open}
              deadline={item.registration_deadline}
            />
          )}
          <SeatsMeter max={item.max_participants} seatsLeft={item.seats_left} />
        </div>
        {cancelled && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Sự kiện này đã bị hủy nên không còn trang chi tiết.
          </p>
        )}
        {!cancelled && (
          <div className="mt-2">
            <QuickRegisterButton item={item} myStatus={myStatus} />
          </div>
        )}
      </div>
      {item.cover_url !== null && (
        <img
          src={item.cover_url}
          alt=""
          loading="lazy"
          className="hidden h-20 w-28 shrink-0 rounded-lg border border-zinc-200 object-cover @md:block dark:border-zinc-800"
        />
      )}
    </li>
  );
}
