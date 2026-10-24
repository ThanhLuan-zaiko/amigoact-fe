import { useState, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCalendar } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { ACTIVITY_STATUS_LABELS } from "./messages.tsx";
import {
  applyFilters,
  groupByTime,
  readFilters,
  summarize,
  type FeedFilters,
} from "./feed-utils.ts";
import { useLiveMyActivities, useMyActivities } from "./feed-hooks.ts";
import { ActiveFilters, type ActiveFilter } from "./components/ActiveFilters.tsx";
import { ActivityFeed, type FeedSection } from "./components/ActivityFeed.tsx";
import { FeedCreate } from "./components/FeedCreate.tsx";
import { FeedSummary } from "./components/FeedSummary.tsx";

function dayLabel(day: string): string {
  const [, month, date] = day.split("-");
  return `Ngày ${Number(date)}/${Number(month)}`;
}

// Cross-org events page. The feed shows every activity of every org the
// caller belongs to; the right rail (EventsRail) holds the filters.
export function ManageEventsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const creating = searchParams.get("create") === "1";
  const feed = useMyActivities(filters.trash);
  const orgs = feed.data?.orgs ?? [];
  const items = feed.data?.items ?? [];
  // Managers first, so the realtime budget goes to the orgs they run.
  useLiveMyActivities(
    [...orgs]
      .sort((a, b) => Number(b.can_manage) - Number(a.can_manage))
      .map((org) => org.id),
  );
  // Captured once per mount so render stays pure; "upcoming" is relative
  // to when the page opened.
  const [now] = useState(() => new Date());

  const visible = applyFilters(items, filters);
  const groups = groupByTime(visible, now);
  const counts = summarize(visible, now);
  const createOrgs = orgs.filter((org) => org.can_create);
  const defaultCreateOrg =
    createOrgs.find((org) => org.id === filters.org)?.id ??
    createOrgs[0]?.id ??
    "";
  const sections: FeedSection[] = filters.trash
    ? [{ title: "Thùng rác", items: visible }]
    : [
        { title: "Đang diễn ra", items: groups.live },
        { title: "Sắp tới", items: groups.upcoming },
        { title: "Đã qua", items: groups.past },
      ].filter((section) => section.items.length > 0);

  function patch(next: Record<string, string | null>): void {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(next)) {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        }
        return params;
      },
      { replace: true },
    );
  }

  const activeFilters = activeFilterChips(filters, orgs, items);
  const filtered = activeFilters.length > 0;

  return (
    <>
      <Section>
        <div className="flex items-center gap-2">
          <FiCalendar
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Quản lý hoạt động
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Hoạt động của mọi tổ chức bạn tham gia. Lọc theo tổ chức, trạng thái
          hoặc ngày ở cột bên phải.
        </p>
      </Section>

      {creating && (
        <Section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Hoạt động mới
          </h2>
          <div className="mt-3">
            {createOrgs.length > 0 ? (
              <FeedCreate
                orgs={createOrgs}
                initialOrgId={defaultCreateOrg}
                onDone={() => patch({ create: null })}
              />
            ) : (
              <EmptyState
                title="Chưa thể tạo hoạt động"
                message="Bạn chưa có quyền tạo hoạt động ở tổ chức nào."
              />
            )}
          </div>
        </Section>
      )}

      {feed.isPending && (
        <Section>
          <LoadingState label="Đang tải hoạt động…" />
        </Section>
      )}
      {feed.isError && (
        <Section>
          <ErrorState
            title="Không tải được"
            message={feed.error.message}
          />
        </Section>
      )}

      {feed.isSuccess && (
        <Section>
          <div className="flex flex-col gap-3">
            <FeedSummary counts={counts} />
            <ActiveFilters
              filters={activeFilters}
              onClear={(key) => patch({ [key]: null })}
              onClearAll={() =>
                patch({ org: null, status: null, tag: null, day: null, q: null })
              }
            />
          </div>
        </Section>
      )}

      {feed.isSuccess && orgs.length === 0 && (
        <Section>
          <EmptyState
            title="Chưa có tổ chức"
            message="Tham gia hoặc tạo tổ chức để xem hoạt động tại đây."
          />
        </Section>
      )}
      {feed.isSuccess && orgs.length > 0 && visible.length === 0 && (
        <Section>
          <EmptyState
            title={
              filters.trash
                ? "Thùng rác trống"
                : filtered
                  ? "Không có hoạt động"
                  : "Chưa có hoạt động"
            }
            message={
              filters.trash
                ? "Các hoạt động đã xóa mềm ở tổ chức bạn quản lý sẽ hiện ở đây."
                : filtered
                  ? "Thử bỏ bớt bộ lọc ở trên để xem thêm hoạt động."
                  : "Tạo bản nháp đầu tiên ở một tổ chức bạn quản lý."
            }
          />
        </Section>
      )}
      {visible.length > 0 && (
        <ActivityFeed sections={sections} orgs={orgs} />
      )}
    </>
  );
}

// Chips for the filters currently in the URL, labelled for the user.
function activeFilterChips(
  filters: FeedFilters,
  orgs: { id: string; name: string }[],
  items: { tags: { slug: string; name: string }[] }[],
): ActiveFilter[] {
  const chips: ActiveFilter[] = [];
  if (filters.org !== null) {
    const name = orgs.find((org) => org.id === filters.org)?.name;
    chips.push({ key: "org", label: name ?? "Tổ chức" });
  }
  if (filters.status !== null) {
    chips.push({
      key: "status",
      label: ACTIVITY_STATUS_LABELS[filters.status] ?? filters.status,
    });
  }
  if (filters.tag !== null) {
    const name = items
      .flatMap((item) => item.tags)
      .find((tag) => tag.slug === filters.tag)?.name;
    chips.push({ key: "tag", label: `#${name ?? filters.tag}` });
  }
  if (filters.day !== null) {
    chips.push({ key: "day", label: dayLabel(filters.day) });
  }
  if (filters.q.trim() !== "") {
    chips.push({ key: "q", label: `Tìm: ${filters.q.trim()}` });
  }
  return chips;
}
