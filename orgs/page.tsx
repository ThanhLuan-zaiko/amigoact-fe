import { useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { Pagination } from "../core/components/Pagination.tsx";
import { useRiseOn } from "../core/motion.ts";
import type { OrgKind, PublicOrgSort } from "./api.ts";
import { useOrgsRealtime, usePublicOrgs } from "./hooks.ts";
import { toVietnameseOrgsMessage } from "./messages.tsx";
import { splitDirectory } from "./utils.ts";
import { OrgCard } from "./components/OrgCard.tsx";
import { OrgHeroCard } from "./components/OrgHeroCard.tsx";
import { OrgNewestRail } from "./components/OrgNewestRail.tsx";
import { OrgSpotlightCard } from "./components/OrgSpotlightCard.tsx";
import { OrgStatsCard } from "./components/OrgStatsCard.tsx";

const PAGE_SIZE = 24;
const KINDS: string[] = ["organization", "club", "group", "business"];
const SORTS: string[] = ["newest", "name", "members"];

export function OrgsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  useOrgsRealtime();

  // Filter state lives in the URL so every view is deep-linkable (AGENTS.md 7.9).
  const query = searchParams.get("q") ?? "";
  const kindParam = searchParams.get("kind") ?? "all";
  const kind = KINDS.includes(kindParam) ? kindParam : "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: PublicOrgSort = SORTS.includes(sortParam)
    ? (sortParam as PublicOrgSort)
    : "newest";
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const updateParams = useCallback(
    (patch: Record<string, string | null>, replace = false): void => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null || value === "") next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const orgs = usePublicOrgs({
    q: query || undefined,
    kind: kind === "all" ? undefined : (kind as OrgKind),
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const items = orgs.data?.items ?? [];
  const total = orgs.data?.total ?? 0;
  const counts = orgs.data?.counts ?? [];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = orgs.data !== undefined && page > totalPages;
  const filtering = query.trim() !== "" || kind !== "all";
  const { spotlight, rail, rest } = splitDirectory(items);

  const mosaicRef = useRiseOn<HTMLDivElement>(`${current}:${items.length}`);

  // Pull an out-of-range ?page= back once totals arrive.
  useEffect(() => {
    if (orgs.data !== undefined && page > totalPages) {
      updateParams({ page: totalPages > 1 ? String(totalPages) : null }, true);
    }
  }, [orgs.data, page, totalPages, updateParams]);

  function resetFilters(): void {
    updateParams({ q: null, kind: null, sort: null, page: null }, true);
  }

  return (
    <>
      <OrgHeroCard
        query={query}
        onQuery={(value) => updateParams({ q: value || null, page: null }, true)}
        kind={kind}
        onKind={(key) =>
          updateParams({ kind: key === "all" ? null : key, page: null })
        }
        counts={counts}
        sort={sort}
        onSort={(key) =>
          updateParams({ sort: key === "newest" ? null : key, page: null })
        }
        total={total}
      />
      <OrgStatsCard total={total} counts={counts} isPending={orgs.isPending} />
      <div className="contents" aria-live="polite" aria-busy={orgs.isPending}>
        {orgs.isPending && (
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <LoadingState label="Đang tải danh sách tổ chức…" />
          </BentoCard>
        )}
        {orgs.isError && (
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <ErrorState
              title="Không tải được danh sách"
              message={toVietnameseOrgsMessage(
                orgs.error instanceof ApiError
                  ? orgs.error.code
                  : "REQUEST_FAILED",
              )}
            />
          </BentoCard>
        )}
        {orgs.data && total === 0 && (
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <EmptyState
              title={filtering ? "Không có tổ chức phù hợp" : "Chưa có tổ chức nào"}
              message={
                filtering
                  ? "Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ."
                  : "Các tổ chức, câu lạc bộ và hội nhóm sẽ hiện ở đây khi được tạo."
              }
              actionLabel={filtering ? "Xóa bộ lọc" : undefined}
              onAction={filtering ? resetFilters : undefined}
            />
          </BentoCard>
        )}
        {orgs.data && !outOfRange && spotlight !== null && (
          <OrgSpotlightCard org={spotlight} />
        )}
        {orgs.data && !outOfRange && rail.length > 0 && (
          <OrgNewestRail items={rail} />
        )}
        {orgs.data && !outOfRange && rest.length > 0 && (
          <div ref={mosaicRef} className="contents">
            {rest.map((org) => (
              <OrgCard key={org.id} org={org} />
            ))}
          </div>
        )}
        {outOfRange && (
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <LoadingState label="Đang tải danh sách tổ chức…" />
          </BentoCard>
        )}
        {orgs.data && totalPages > 1 && (
          <BentoCard className="md:col-span-6 lg:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {`Trang ${current} / ${totalPages} · ${total} tổ chức`}
              </p>
              <Pagination
                page={current}
                totalPages={totalPages}
                onPage={(n) =>
                  updateParams({ page: n > 1 ? String(n) : null })
                }
              />
            </div>
          </BentoCard>
        )}
      </div>
    </>
  );
}
