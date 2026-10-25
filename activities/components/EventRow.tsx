import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import type { BrowseItem } from "../browse-api.ts";
import { placeLine } from "../place.tsx";
import { DateTile } from "./DateTile.tsx";
import { MyRegistrationChip } from "./MyRegistrationChip.tsx";
import { RegistrationStateChip } from "./RegistrationStateChip.tsx";
import { SeatsMeter } from "./SeatsMeter.tsx";
import { StateChip } from "./StateChip.tsx";

interface EventRowProps {
  item: BrowseItem;
  myStatus?: string;
}

// One feed row: date, title, organizer, place, then state chips. Presentational
// only; the caller passes the signed-in status in, so the row calls no hooks.
export function EventRow({ item, myStatus }: EventRowProps): ReactElement {
  const place = placeLine(item);
  return (
    <li>
      <Link
        to={`/events/${item.org_id}/${item.slug}`}
        className="group flex gap-3 px-4 py-3 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
      >
        <DateTile iso={item.start_at} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-zinc-900 group-hover:underline sm:text-base dark:text-zinc-100">
            {item.title}
          </h3>
          <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            <Avatar name={item.org.name} src={item.org.logo_url} size="xs" />
            <span className="truncate">{item.org.name}</span>
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
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {myStatus !== undefined && <MyRegistrationChip status={myStatus} />}
            {item.phase === "cancelled" ? (
              <StateChip tone="zinc">Đã hủy</StateChip>
            ) : (
              <RegistrationStateChip
                open={item.registration_open}
                deadline={item.registration_deadline}
              />
            )}
            <SeatsMeter max={item.max_participants} seatsLeft={item.seats_left} />
          </div>
        </div>
        {item.cover_url !== null && (
          <img
            src={item.cover_url}
            alt=""
            loading="lazy"
            className="hidden h-20 w-28 shrink-0 rounded-lg border border-zinc-200 object-cover @md:block dark:border-zinc-800"
          />
        )}
      </Link>
    </li>
  );
}
