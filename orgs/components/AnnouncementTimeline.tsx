import { useEffect, useRef, type ReactElement } from "react";
import {
  FiCalendar,
  FiChevronRight,
  FiFileText,
  FiMessageSquare,
  FiUser,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import type { PublicTimelineItem } from "../api.ts";
import { orgMediaUrl } from "../api.ts";
import {
  useAnnouncementFeed,
  useAnnouncementsRealtime,
} from "../hooks.ts";
import { toVietnameseOrgsMessage } from "../messages.tsx";
import { OrgLogo } from "./OrgLogo.tsx";

function TimelineRow({ item }: { item: PublicTimelineItem }): ReactElement {
  const published =
    item.published_at === null
      ? null
      : new Date(item.published_at).toLocaleDateString("vi-VN");
  return (
    <li>
      <Link
        to={`/orgs/${item.org.slug}/posts/${item.id}`}
        className="group flex gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
      >
        <OrgLogo org={item.org} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-bold text-zinc-900 group-hover:underline dark:text-zinc-100">
              {item.org.name}
            </span>
            {published !== null && (
              <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                <FiCalendar className="h-3 w-3" aria-hidden="true" />
                {published}
              </span>
            )}
          </p>
          <div className="mt-1 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </p>
              {item.excerpt !== "" && (
                <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.excerpt}
                </p>
              )}
            </div>
            {item.cover_url !== null && (
              <img
                src={orgMediaUrl(item.cover_url)}
                alt=""
                loading="lazy"
                className="h-14 w-20 shrink-0 rounded-lg border border-zinc-200 object-cover dark:border-zinc-800"
              />
            )}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <FiUser className="h-3.5 w-3.5" aria-hidden="true" />
              {item.author_name}
            </span>
            <span className="flex items-center gap-1">
              <FiMessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
              {`${item.comment_count} bình luận`}
            </span>
          </p>
        </div>
        <FiChevronRight
          className="mt-1 h-4 w-4 shrink-0 self-center text-zinc-400 dark:text-zinc-500"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

// Global social timeline on the home column: the newest published
// announcements across every org, newest first. Each row opens the
// public reader at /orgs/:slug/posts/:postId; discussions stay internal.
// A sentinel under the list auto-fetches the next cursor page ~600px
// before the user reaches it - no button, X-style silent loading.
export function AnnouncementTimeline(): ReactElement {
  useAnnouncementsRealtime();
  const feed = useAnnouncementFeed();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = feed;
  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const pageCount = data?.pages.length ?? 0;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(isFetchingNextPage);
  useEffect(() => {
    fetchingRef.current = isFetchingNextPage;
  }, [isFetchingNextPage]);

  // Re-arm after every successful page (pageCount changes) so a sentinel
  // still inside the margin keeps the chain going; a failed page leaves
  // deps untouched, so no retry storm - scrolling back retries.
  useEffect(() => {
    const node = sentinelRef.current;
    if (node === null || !hasNextPage) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          fetchingRef.current ||
          !entries.some((entry) => entry.isIntersecting)
        ) {
          return;
        }
        fetchingRef.current = true;
        void fetchNextPage();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, pageCount]);

  return (
    <section aria-busy={feed.isPending}>
      <Section>
        <div data-rise>
          <h2 className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            <FiFileText
              className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            Bảng tin từ các tổ chức
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Thông báo mới nhất từ mọi tổ chức trên AmigoACT.
          </p>
        </div>
      </Section>
      {feed.isPending && (
        <Section>
          <LoadingState label="Đang tải bảng tin…" />
        </Section>
      )}
      {feed.isError && (
        <Section>
          <ErrorState
            title="Không tải được bảng tin"
            message={toVietnameseOrgsMessage(
              feed.error instanceof ApiError
                ? feed.error.code
                : "REQUEST_FAILED",
            )}
          />
        </Section>
      )}
      {data !== undefined && items.length === 0 && (
        <Section>
          <EmptyState
            title="Chưa có thông báo nào"
            message="Khi các tổ chức đăng thông báo, chúng sẽ hiện ở đây."
          />
        </Section>
      )}
      {items.length > 0 && (
        <Section>
          <ul className="-mx-4 -my-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((item) => (
              <TimelineRow key={item.id} item={item} />
            ))}
          </ul>
        </Section>
      )}
      {hasNextPage && (
        <Section>
          <div ref={sentinelRef} className="flex min-h-6 justify-center">
            {isFetchingNextPage && <LoadingState label="Đang tải thêm…" />}
          </div>
        </Section>
      )}
      {hasNextPage === false && items.length > 0 && (
        <Section>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Bạn đã đọc hết thông báo mới.
          </p>
        </Section>
      )}
    </section>
  );
}
