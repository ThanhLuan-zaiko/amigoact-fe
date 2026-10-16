import { useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import { useRiseOn } from "../../core/motion.ts";
import { useOrgsRealtime, usePublicOrgs } from "../hooks.ts";
import { toVietnameseOrgsMessage } from "../messages.tsx";
import { DirectoryRow } from "./DirectoryRow.tsx";

const PAGE_SIZE = 24;

// The full public directory on the home column's "To chuc" tab: one uniform
// X-style row per org, no in-feed filter chrome. The right-rail search pill
// drives ?q=, and the strip below echoes the active query with a clear
// action. Query and page state live in the URL so views stay deep-linkable.
export function OrgDirectory(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  useOrgsRealtime();

  const query = searchParams.get("q") ?? "";
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
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const items = orgs.data?.items ?? [];
  const total = orgs.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = orgs.data !== undefined && page > totalPages;
  const searching = query.trim() !== "";

  const listRef = useRiseOn<HTMLUListElement>(`${current}:${items.length}`);

  // Pull an out-of-range ?page= back once totals arrive.
  useEffect(() => {
    if (orgs.data !== undefined && page > totalPages) {
      updateParams({ page: totalPages > 1 ? String(totalPages) : null }, true);
    }
  }, [orgs.data, page, totalPages, updateParams]);

  function clearSearch(): void {
    updateParams({ q: null, page: null }, true);
  }

  return (
    <>
      {searching && (
        <Section>
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm text-zinc-500 dark:text-zinc-400">
              {`Kết quả cho “${query.trim()}”`}
            </p>
            <Button
              type="button"
              variant="ghost"
              onClick={clearSearch}
              icon={<FiX className="h-4 w-4" aria-hidden="true" />}
            >
              Xóa
            </Button>
          </div>
        </Section>
      )}
      <div className="contents" aria-live="polite" aria-busy={orgs.isPending}>
        {orgs.isPending && (
          <Section>
            <LoadingState label="Đang tải danh sách tổ chức…" />
          </Section>
        )}
        {orgs.isError && (
          <Section>
            <ErrorState
              title="Không tải được danh sách"
              message={toVietnameseOrgsMessage(
                orgs.error instanceof ApiError
                  ? orgs.error.code
                  : "REQUEST_FAILED",
              )}
            />
          </Section>
        )}
        {orgs.data && total === 0 && (
          <Section>
            <EmptyState
              title={searching ? "Không có tổ chức phù hợp" : "Chưa có tổ chức nào"}
              message={
                searching
                  ? "Thử từ khóa khác hoặc xóa tìm kiếm để xem toàn bộ."
                  : "Các tổ chức, câu lạc bộ và hội nhóm sẽ hiện ở đây khi được tạo."
              }
              actionLabel={searching ? "Xóa tìm kiếm" : undefined}
              onAction={searching ? clearSearch : undefined}
            />
          </Section>
        )}
        {orgs.data && !outOfRange && items.length > 0 && (
          <Section>
            <ul
              ref={listRef}
              className="-mx-4 -my-4 divide-y divide-zinc-200 dark:divide-zinc-800"
            >
              {items.map((org) => (
                <DirectoryRow key={org.id} org={org} />
              ))}
            </ul>
          </Section>
        )}
        {outOfRange && (
          <Section>
            <LoadingState label="Đang tải danh sách tổ chức…" />
          </Section>
        )}
        {orgs.data && totalPages > 1 && (
          <Section>
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
          </Section>
        )}
      </div>
    </>
  );
}
