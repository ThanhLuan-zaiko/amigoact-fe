import type { ReactElement } from "react";
import { FiCalendar, FiChevronRight, FiMapPin, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import type { PublicOrgDetail } from "../api.ts";
import { ACTIVITY_STATUS_LABELS } from "../messages.tsx";

interface OrgActivityListProps {
  org: PublicOrgDetail;
}

export function OrgActivityList({ org }: OrgActivityListProps): ReactElement {
  return (
    <Section>
      <div data-rise>
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <FiZap
              className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            Hoạt động đã tổ chức
          </h2>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            {org.activity_count}
          </span>
        </div>
        {org.activities.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {org.activities.map((activity) => (
              <li key={activity.id}>
                <Link
                  to={`/events/${org.id}/${activity.slug}`}
                  className="group flex items-center gap-3 rounded-lg py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                      {activity.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {activity.start_at && (
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {new Date(activity.start_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      )}
                      {activity.city && (
                        <span className="flex items-center gap-1">
                          <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {activity.city}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    {ACTIVITY_STATUS_LABELS[activity.status] ?? activity.status}
                  </span>
                  <FiChevronRight
                    className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-3">
            <EmptyState
              title="Chưa có hoạt động"
              message="Tổ chức chưa tổ chức hoạt động công khai nào trên AmigoACT."
            />
          </div>
        )}
      </div>
    </Section>
  );
}
