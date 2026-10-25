import { useState, type ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { RAIL_ROW, RailCard } from "../../core/components/RailCard.tsx";
import { formatDateTime } from "../dates.tsx";
import type { MyActivityItem } from "../feed-api.ts";
import { useLiveMyActivities, useMyActivities } from "../feed-hooks.ts";
import { StatusChip } from "./ActivityCard.tsx";

const MAX_ROWS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
// Drafts stay visible to their managers; completed and cancelled do not.
const LIVE_STATUSES = new Set(["draft", "published", "ongoing"]);

function startTime(item: MyActivityItem): number {
  return item.start_at === null
    ? Number.POSITIVE_INFINITY
    : Date.parse(item.start_at);
}

// The /manage/events feed for the rail: open activities across the caller's
// orgs, soonest first, with the same live refresh the manage page uses.
export function MyEventsCard(): ReactElement {
  const feed = useMyActivities();
  const orgIds = (feed.data?.orgs ?? []).map((org) => org.id);
  useLiveMyActivities(orgIds);
  // Read the clock once per mount so render stays pure.
  const [clock] = useState(() => Date.now());
  const rows = (feed.data?.items ?? [])
    .filter(
      (item) =>
        LIVE_STATUSES.has(item.status) && startTime(item) >= clock - DAY_MS,
    )
    .sort((a, b) => startTime(a) - startTime(b))
    .slice(0, MAX_ROWS);

  return (
    <RailCard title="Sự kiện của tôi" moreTo="/manage/events">
      {feed.isPending && (
        <div className="px-4 pb-4">
          <LoadingState label="Đang tải sự kiện…" />
        </div>
      )}
      {feed.isError && (
        <div className="px-4 pb-4">
          <ErrorState
            title="Không tải được"
            message="Thử lại sau ít phút."
          />
        </div>
      )}
      {feed.isSuccess && rows.length === 0 && (
        <div className="px-4 pb-4">
          <EmptyState
            title="Chưa có sự kiện nào"
            message="Sự kiện của các tổ chức bạn tham gia sẽ hiện ở đây."
          />
        </div>
      )}
      <ul>
        {rows.map((item) => (
          <li key={item.id}>
            <Link
              to={`/manage/events/${item.org_id}/${item.id}`}
              className={RAIL_ROW}
            >
              <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {item.title}
              </span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                {formatDateTime(item.start_at)}
                <StatusChip status={item.status} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}
