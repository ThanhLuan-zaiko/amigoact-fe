import type { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { FiCompass } from "react-icons/fi";
import { EmptyState } from "../core/components/Feedback.tsx";
import { Section } from "../core/components/Section.tsx";
import {
  useBrowse,
  useBrowseMine,
  useEventsRealtime,
  useEventsUrl,
  useMyBriefMap,
  useSignedIn,
} from "./browse-hooks.ts";
import {
  CLEARED_FILTERS,
  hasNarrowing,
  toMineQuery,
  toPublicQuery,
} from "./browse-utils.ts";
import { EventsFeed, type FeedRow } from "./components/EventsFeed.tsx";

// The feed column. Tabs, search and filters live in the right rail
// (EventsBrowseRail) and share this page's URL state.
export function EventsPage(): ReactElement {
  const navigate = useNavigate();
  const { filters, patch } = useEventsUrl();
  const signedIn = useSignedIn();
  const mineView = signedIn && filters.tab === "mine";
  const browse = useBrowse(toPublicQuery(filters), filters.tab !== "mine");
  const mine = useBrowseMine(toMineQuery(filters), mineView);
  const briefs = useMyBriefMap(signedIn);
  useEventsRealtime();

  const source = mineView ? mine : browse;
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
      <Section>
        <div
          id="events-feed"
          role="tabpanel"
          aria-labelledby={`events-tab-${filters.tab}`}
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
              total={source.data?.total ?? 0}
              truncated={source.data?.truncated ?? false}
              dimmed={source.isPlaceholderData}
              page={filters.page}
              narrowed={hasNarrowing(filters)}
              onRetry={() => void source.refetch()}
              onClear={() => patch(CLEARED_FILTERS)}
              onPage={(page) =>
                patch({ page: page > 1 ? String(page) : null })
              }
            />
          )}
        </div>
      </Section>
    </>
  );
}
