import { useEffect, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import { EmptyState } from "../core/components/Feedback.tsx";
import { Section } from "../core/components/Section.tsx";
import { useMediaQuery } from "../core/media-query.ts";
import { prefersReducedMotion } from "../core/motion.ts";
import { useDocumentTitle } from "../core/page-title.ts";
import { SIGNED_IN_TABS, GUEST_TABS, useEventsBrowseState } from "./browse-state-hooks.ts";
import {
  EVENTS_PAGE_SIZE,
  CLEARED_FILTERS,
  hasNarrowing,
} from "./browse-utils.ts";
import { useEventsRealtime, useMyBriefMap } from "./browse-hooks.ts";
import { EventsMobileBar } from "./components/EventsMobileBar.tsx";
import { EventsFeed, type FeedRow, type WindowNav } from "./components/EventsFeed.tsx";
import { OrgScopeChip } from "./components/OrgScopeChip.tsx";

// Paging and window changes move the reader back to the top of the feed.
function scrollToFeed(): void {
  document.getElementById("events-feed")?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
}

// The feed column. Filters live in the desktop rail (EventsBrowseRail); on
// phones the same controls sit above the feed (EventsMobileBar).
export function EventsPage(): ReactElement {
  const navigate = useNavigate();
  const state = useEventsBrowseState();
  const { filters, patch, signedIn, mineView, browse, mine } = state;
  const desktop = useMediaQuery("(min-width: 1024px)");
  const briefs = useMyBriefMap(signedIn);
  useEventsRealtime();
  useDocumentTitle("Khám phá sự kiện");

  const source = mineView ? mine : browse;
  const total = source.data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / EVENTS_PAGE_SIZE));
  // A page past the end (a hand-edited URL, or rows removed by a refresh)
  // would show an empty feed with no pager, so step back to the last page.
  useEffect(() => {
    if (source.isPlaceholderData || source.data === undefined) return;
    if (filters.page > lastPage) {
      patch({ page: lastPage > 1 ? String(lastPage) : null });
    }
  }, [source.data, source.isPlaceholderData, filters.page, lastPage, patch]);

  const nextCursor = mineView ? null : (browse.data?.next_cursor ?? null);
  const windowNav: WindowNav = {
    next:
      nextCursor === null
        ? null
        : () => {
            patch({ cursor: nextCursor, page: null }, true);
            scrollToFeed();
          },
    first:
      filters.cursor === ""
        ? null
        : () => {
            patch({ cursor: null, page: null }, true);
            scrollToFeed();
          },
  };

  const rows: FeedRow[] = mineView
    ? (mine.data?.items ?? []).map((item) => ({
        item,
        myStatus: item.my_registration.status,
      }))
    : (browse.data?.items ?? []).map((item) => ({
        item,
        myStatus: briefs[item.id]?.status,
      }));
  const guestMine = filters.tab === "mine" && !signedIn;

  return (
    <>
      <Section>
        <div className="flex items-center gap-2">
          <FiCompass
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Khám phá sự kiện
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Các hoạt động tình nguyện đang mở đăng ký và sắp diễn ra từ cộng đồng.
        </p>
      </Section>
      {!desktop && (
        <Section>
          <EventsMobileBar
            state={state}
            tabs={signedIn ? SIGNED_IN_TABS : GUEST_TABS}
          />
        </Section>
      )}
      <Section>
        {filters.org !== "" && !mineView && (
          <div className="mb-3">
            <OrgScopeChip
              slug={filters.org}
              onClear={() => patch({ org: null })}
            />
          </div>
        )}
        <div
          id="events-feed"
          role="tabpanel"
          aria-label="Danh sách sự kiện"
          className="scroll-mt-16"
        >
          {guestMine ? (
            <EmptyState
              title="Đăng nhập để xem sự kiện của bạn"
              message="Các sự kiện bạn đã đăng ký sẽ hiện ở đây."
              actionLabel="Đăng nhập"
              onAction={() => navigate("/login")}
            />
          ) : (
            <EventsFeed
              tab={filters.tab}
              loading={source.isPending}
              error={source.error}
              rows={rows}
              total={total}
              truncated={source.data?.truncated ?? false}
              dimmed={source.isPlaceholderData}
              page={filters.page}
              narrowed={hasNarrowing(filters)}
              windowNav={windowNav}
              onRetry={() => void source.refetch()}
              onClear={() => patch(CLEARED_FILTERS)}
              onPage={(page) => {
                patch({ page: page > 1 ? String(page) : null }, true);
                scrollToFeed();
              }}
            />
          )}
        </div>
      </Section>
    </>
  );
}
