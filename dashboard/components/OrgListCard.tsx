import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { FiPlusCircle, FiTrash2, FiUsers, FiX } from "react-icons/fi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import { ApiError } from "../../core/api.ts";
import { useRiseOn } from "../../core/motion.ts";
import { useSession } from "../../auth/hooks.ts";
import { useMyOrgs } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { OrgEditModal } from "./OrgEditModal.tsx";
import { OrgListToolbar, type OrgSort } from "./OrgListToolbar.tsx";
import { OrgMediaModal } from "./OrgMediaModal.tsx";
import { OrgRow } from "./OrgRow.tsx";

const PAGE_SIZE = 5;
const TRASH_LIMIT = 100;
const SORTS: string[] = ["newest", "name", "members"];

export function OrgListCard(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter state lives in the URL so every view is deep-linkable (AGENTS.md 7.9).
  const query = searchParams.get("q") ?? "";
  const bucket = searchParams.get("status") ?? "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: OrgSort = SORTS.includes(sortParam) ? (sortParam as OrgSort) : "newest";
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const mediaOrgId = searchParams.get("media");

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

  // Live list is server-driven; trash and modal lookup fetch wide instead.
  const orgs = useMyOrgs(false, {
    q: query || undefined,
    status: bucket === "all" ? undefined : bucket,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const trash = useMyOrgs(true, { limit: TRASH_LIMIT });
  const allOrgs = useMyOrgs(false, { limit: TRASH_LIMIT }, mediaOrgId !== null);

  const items = orgs.data?.items ?? [];
  const total = orgs.data?.total ?? 0;
  const counts: [string, number][] = (orgs.data?.counts ?? []).map(
    (entry): [string, number] => [entry.bucket, entry.count],
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = orgs.data !== undefined && page > totalPages;
  const filtering = query.trim() !== "" || bucket !== "all";
  const trashed = (trash.data?.items ?? []).filter((org) => org.deleted_at !== null);
  const mediaOrg = mediaOrgId === null ? null : (allOrgs.data?.items.find((org) => org.id === mediaOrgId) ?? null);
  const editingOrg = editingId === null ? null : (items.find((org) => org.id === editingId) ?? null);

  const listRef = useRiseOn<HTMLUListElement>(`${current}:${items.length}`);
  const trashRef = useRiseOn<HTMLUListElement>(trashed.length);

  // Pull an out-of-range ?page= back once totals arrive.
  useEffect(() => {
    if (orgs.data !== undefined && page > totalPages) {
      updateParams({ page: totalPages > 1 ? String(totalPages) : null }, true);
    }
  }, [orgs.data, page, totalPages, updateParams]);

  // Drop a stale ?media= param once the lookup has loaded without that org.
  useEffect(() => {
    if (mediaOrgId !== null && allOrgs.data !== undefined && mediaOrg === null) {
      updateParams({ media: null }, true);
    }
  }, [mediaOrgId, allOrgs.data, mediaOrg, updateParams]);

  const closeMedia = useCallback((): void => {
    // Back closes the modal; a direct deep link just clears the param instead.
    if (location.key !== "default") navigate(-1);
    else updateParams({ media: null }, true);
  }, [location.key, navigate, updateParams]);

  function resetFilters(): void {
    updateParams({ q: null, status: null, sort: null, page: null }, true);
  }

  return (
    <>
      <Section>
        <div data-rise className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
            <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Tổ chức của tôi
            </h3>
            {orgs.data && total > 0 && (
              <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                {total}
              </span>
            )}
          </div>
          <Button
            to="/manage/orgs/create"
            variant="secondary"
            icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Tạo mới
          </Button>
        </div>
        {(total > 0 || filtering) && (
          <OrgListToolbar
            query={query}
            onQuery={(value) => updateParams({ q: value || null, page: null }, true)}
            bucket={bucket}
            onBucket={(key) => updateParams({ status: key === "all" ? null : key, page: null })}
            counts={counts}
            sort={sort}
            onSort={(key) => updateParams({ sort: key === "newest" ? null : key, page: null })}
            total={total}
          />
        )}
        <div className="mt-3" aria-live="polite" aria-busy={orgs.isPending}>
          {orgs.isPending && <LoadingState label="Đang tải danh sách tổ chức…" />}
          {orgs.isError && (
            <ErrorState
              title="Không tải được danh sách"
              message={toVietnameseDashboardMessage(
                orgs.error instanceof ApiError ? orgs.error.code : "REQUEST_FAILED",
              )}
            />
          )}
          {orgs.data && !filtering && total === 0 && (
            <>
              <EmptyState
                title="Chưa có tổ chức nào"
                message="Tạo tổ chức, câu lạc bộ hay hội nhóm đầu tiên của bạn."
              />
              <div className="mt-3">
                <Button
                  to="/manage/orgs/create"
                  variant="primary"
                  icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
                >
                  Tạo tổ chức
                </Button>
              </div>
            </>
          )}
          {outOfRange && <LoadingState label="Đang tải danh sách tổ chức…" />}
          {orgs.data && filtering && total === 0 && !outOfRange && (
            <EmptyState
              title="Không có tổ chức phù hợp"
              message="Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ."
              actionLabel="Xóa bộ lọc"
              onAction={resetFilters}
            />
          )}
          {!outOfRange && items.length > 0 && (
            <>
              <ul ref={listRef} className="flex flex-col gap-3">
                {items.map((org) => (
                  <OrgRow
                    key={org.id}
                    org={org}
                    editing={editingId === org.id}
                    compact={false}
                    onEdit={() => setEditingId(org.id)}
                    onOpenMedia={() => updateParams({ media: org.id })}
                  />
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {`Trang ${current} / ${totalPages} · ${total} tổ chức`}
                </p>
                <Pagination
                  page={current}
                  totalPages={totalPages}
                  onPage={(n) => updateParams({ page: n > 1 ? String(n) : null })}
                />
              </div>
            </>
          )}
          {filtering && items.length > 0 && (
            <div className="mt-3">
              <Button type="button" variant="ghost" onClick={resetFilters} icon={<FiX className="h-4 w-4" aria-hidden="true" />}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </Section>
      {trashed.length > 0 && (
        <Section>
          <div className="flex items-center gap-2">
            <FiTrash2 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
            <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Thùng rác
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tổ chức đã xóa mềm. Khôi phục để dùng tiếp, hoặc xóa cứng để xóa vĩnh viễn cùng toàn bộ tệp.
          </p>
          <ul ref={trashRef} className="mt-3 flex flex-col gap-3">
            {trashed.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                editing={false}
                compact={true}
                onEdit={() => {}}
                onOpenMedia={() => {}}
              />
            ))}
          </ul>
        </Section>
      )}
      {mediaOrg && (
        <OrgMediaModal
          org={mediaOrg}
          canManage={mediaOrg.owner_id === session.data?.id}
          onClose={closeMedia}
        />
      )}
      {editingOrg && <OrgEditModal org={editingOrg} onClose={() => setEditingId(null)} />}
    </>
  );
}
