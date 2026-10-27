import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiHash } from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import type { BrowseOrg } from "../browse-api.ts";
import type { ActivityDetail } from "../api.ts";
import { StatusChip } from "./ActivityCard.tsx";
import { StateChip } from "./StateChip.tsx";

interface EventDetailHeaderProps {
  activity: ActivityDetail;
  categoryName?: string;
  // Known once the card has loaded; the header works without it.
  org?: BrowseOrg;
}

// Organization line, title, then status, category and tag chips. Tags link
// back to the browse feed.
export function EventDetailHeader({
  activity: a,
  categoryName,
  org,
}: EventDetailHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {org !== undefined && (
        <Link
          to={`/orgs/${org.slug}`}
          className="inline-flex w-fit flex-wrap items-center gap-2 text-sm text-zinc-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:focus-visible:outline-zinc-400"
        >
          <Avatar name={org.name} src={org.logo_url} size="xs" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {org.name}
          </span>
          {org.verified && <StateChip tone="emerald">Đã xác minh</StateChip>}
        </Link>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl dark:text-zinc-100">
          {a.title}
        </h1>
        {a.status !== "published" && <StatusChip status={a.status} />}
        {categoryName && (
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {categoryName}
          </span>
        )}
        {a.tags.map((tag) => (
          <Link
            key={tag.slug}
            to={`/events?tag=${tag.slug}`}
            className="inline-flex items-center gap-0.5 rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
          >
            <FiHash className="h-3 w-3" aria-hidden="true" />
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
