import { useEffect, useRef, type ReactElement } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
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
import { OrgFeedRow } from "./OrgFeedRow.tsx";

function TimelineRow({ item }: { item: PublicTimelineItem }): ReactElement {
  const published =
    item.published_at === null
      ? undefined
      : new Date(item.published_at).toLocaleDateString("vi-VN");
  const avatar =
    item.author_avatar_url === null ? (
      <Avatar name={item.author_name} />
    ) : (
      <img
        src={orgMediaUrl(item.author_avatar_url)}
        alt=""
        loading="lazy"
        className="h-10 w-10 shrink-0 rounded-full border border-zinc-200 bg-white object-cover dark:border-zinc-800 dark:bg-zinc-900"
      />
    );
  return (
    <OrgFeedRow
      avatar={avatar}
      title={item.author_name}
      meta={
        published === undefined
          ? `đăng trong ${item.org.name}`
          : `đăng trong ${item.org.name} · ${published}`
      }
      href={`/orgs/${item.org.slug}/posts/${item.id}`}
      footer={
        <span className="flex items-center gap-1">
          <FiMessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
          {`${item.comment_count} bình luận`}
        </span>
      }
    >
      <p className="mt-0.5 text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">
        {item.title}
      </p>
      {item.excerpt !== "" && (
        <p className="line-clamp-2 text-[15px] text-zinc-600 dark:text-zinc-400">
          {item.excerpt}
        </p>
      )}
      {item.cover_url !== null && (
        <img
          src={orgMediaUrl(item.cover_url)}
          alt=""
          loading="lazy"
          className="mt-2 aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
        />
      )}
    </OrgFeedRow>
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
    <section aria-busy={feed.isPending} aria-label="Bài đăng từ các tổ chức">
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
