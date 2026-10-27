import type { ReactElement } from "react";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import type { BrowseItem } from "../browse-api.ts";
import { EVENTS_PAGE_SIZE, type EventsTab } from "../browse-utils.ts";
import { toVietnameseBrowseMessage } from "../messages.tsx";
import { EventRow } from "./EventRow.tsx";

export interface FeedRow {
  item: BrowseItem;
  myStatus?: string;
}

// Moves between time windows. null means that direction has nothing to offer.
export interface WindowNav {
  next: (() => void) | null;
  first: (() => void) | null;
}

const EMPTY_TITLE: Record<EventsTab, string> = {
  upcoming: "Chưa có sự kiện sắp tới",
  live: "Chưa có sự kiện đang diễn ra",
  past: "Chưa có sự kiện đã qua",
  mine: "Bạn chưa đăng ký sự kiện nào",
};

interface EventsFeedProps {
  tab: EventsTab;
  loading: boolean;
  error: Error | null;
  rows: FeedRow[];
  total: number;
  truncated: boolean;
  dimmed: boolean;
  page: number;
  narrowed: boolean;
  windowNav: WindowNav;
  onRetry: () => void;
  onClear: () => void;
  onPage: (page: number) => void;
  // Set only for callers who can create an activity; adds a button to the
  // empty state so the column always offers a next step.
  onCreate?: () => void;
}

// Every state the feed can show: loading, error, empty (per tab or per
// filter), the list itself, the window footer and the paging footer.
export function EventsFeed({
  tab,
  loading,
  error,
  rows,
  total,
  truncated,
  dimmed,
  page,
  narrowed,
  windowNav,
  onRetry,
  onClear,
  onPage,
  onCreate,
}: EventsFeedProps): ReactElement {
  if (loading) return <LoadingState label="Đang tải sự kiện…" />;
  if (error !== null) {
    const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
    const message = toVietnameseBrowseMessage(code);
    // A rejected cursor or filter is fixed by clearing the filters, not by retrying.
    return code === "VALIDATION_ERROR" ? (
      <ErrorState
        title="Không tải được"
        message={message}
        actionLabel="Xóa bộ lọc"
        onAction={onClear}
      />
    ) : (
      <ErrorState
        title="Không tải được"
        message={message}
        actionLabel="Thử lại"
        onAction={onRetry}
      />
    );
  }
  if (rows.length === 0) {
    if (narrowed) {
      return (
        <EmptyState
          title="Không có sự kiện phù hợp"
          message="Thử bỏ bớt bộ lọc để xem thêm sự kiện."
          actionLabel="Xóa bộ lọc"
          onAction={onClear}
        />
      );
    }
    if (windowNav.next !== null) {
      return (
        <EmptyState
          title="Chưa có sự kiện trong khoảng này"
          message="Xem tiếp các sự kiện xa hơn."
          actionLabel="Xem sự kiện xa hơn"
          onAction={windowNav.next}
        />
      );
    }
    return (
      <EmptyState
        title={EMPTY_TITLE[tab]}
        message="Quay lại sau để xem thêm."
        actionLabel={onCreate ? "Tạo sự kiện" : undefined}
        onAction={onCreate}
      />
    );
  }
  const totalPages = Math.max(1, Math.ceil(total / EVENTS_PAGE_SIZE));
  return (
    <div className="flex flex-col gap-3">
      {truncated && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Mỗi lần chỉ hiển thị một khoảng thời gian. Chọn khoảng ngày hoặc bấm
          &quot;Xem sự kiện xa hơn&quot; để xem tiếp.
        </p>
      )}
      {dimmed && (
        <p role="status" className="sr-only">
          Đang cập nhật…
        </p>
      )}
      <ul
        aria-busy={dimmed}
        className={`-mx-4 -my-4 divide-y divide-zinc-200 dark:divide-zinc-800 ${
          dimmed ? "opacity-60" : ""
        }`}
      >
        {rows.map((row) => (
          <EventRow key={row.item.id} item={row.item} myStatus={row.myStatus} />
        ))}
      </ul>
      <Pagination
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        onPage={onPage}
      />
      {(windowNav.first !== null || windowNav.next !== null) && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          {windowNav.first !== null ? (
            <Button variant="ghost" onClick={windowNav.first}>
              Về đầu danh sách
            </Button>
          ) : (
            <span />
          )}
          {windowNav.next !== null && (
            <Button variant="secondary" onClick={windowNav.next}>
              Xem sự kiện xa hơn
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
