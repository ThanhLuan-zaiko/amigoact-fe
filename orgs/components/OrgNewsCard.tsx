import type { ReactElement } from "react";
import { FiCalendar, FiChevronRight, FiFileText, FiUser } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState } from "../../core/components/Feedback.tsx";
import type { PublicOrgDetail } from "../api.ts";
import { orgMediaUrl } from "../api.ts";

interface OrgNewsCardProps {
  org: PublicOrgDetail;
}

// Published announcements of the org, newest first. Each teaser opens the
// public reader at /orgs/:slug/posts/:postId; discussions stay internal.
export function OrgNewsCard({ org }: OrgNewsCardProps): ReactElement {
  return (
    <Section>
      <div>
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <FiFileText
              className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            Tin tức từ tổ chức
          </h2>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {org.announcement_count}
            </span>
            {org.announcement_count > org.announcements.length && (
              <Link
                to={`/orgs/${org.slug}/posts`}
                className="text-xs font-medium text-zinc-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-300 dark:focus-visible:outline-zinc-400"
              >
                Xem tất cả
              </Link>
            )}
          </span>
        </div>
        {org.announcements.length > 0 ? (
          <ul className="mt-3 divide-y divide-zinc-200 dark:divide-zinc-800">
            {org.announcements.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/orgs/${org.slug}/posts/${post.id}`}
                  className="group flex items-center gap-3 rounded-lg py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400"
                >
                  {post.cover_url !== null && (
                    <img
                      src={orgMediaUrl(post.cover_url)}
                      alt=""
                      loading="lazy"
                      className="h-12 w-16 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 group-hover:underline dark:text-zinc-100">
                      {post.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {post.published_at !== null && (
                        <span className="flex items-center gap-1">
                          <FiCalendar className="h-3.5 w-3.5" aria-hidden="true" />
                          {new Date(post.published_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
                        {post.author_name}
                      </span>
                    </p>
                  </div>
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
              title="Chưa có tin tức"
              message="Tổ chức chưa đăng thông báo nào trên AmigoACT."
            />
          </div>
        )}
      </div>
    </Section>
  );
}
