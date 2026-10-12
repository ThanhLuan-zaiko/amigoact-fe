import { useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import { useRiseOn } from "../../core/motion.ts";
import { useSession } from "../../auth/hooks.ts";
import { useMyOrgs } from "../hooks.ts";
import { useMemberRealtime, useOrgMembers } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { MemberSortParam } from "../api.ts";
import { MemberInviteModal } from "./MemberInviteModal.tsx";
import { MemberListToolbar } from "./MemberListToolbar.tsx";
import { MemberManageActions } from "./MemberManageActions.tsx";
import { MemberOrgPicker } from "./MemberOrgPicker.tsx";
import { MemberRow } from "./MemberRow.tsx";

const PAGE_SIZE = 10;
const ORG_LIMIT = 100;
const SORTS: string[] = ["newest", "name", "role"];

export function MemberListCard(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = useSession();

  // Filter state lives in the URL so every view is deep-linkable (AGENTS.md 7.9).
  const orgParam = searchParams.get("org");
  const query = searchParams.get("q") ?? "";
  const bucket = searchParams.get("status") ?? "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: MemberSortParam = SORTS.includes(sortParam) ? (sortParam as MemberSortParam) : "newest";
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const inviting = searchParams.get("invite") === "1";

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

  const orgs = useMyOrgs(false, { limit: ORG_LIMIT });
  const orgItems = orgs.data?.items ?? [];
  const orgId = orgParam ?? orgItems[0]?.id ?? null;
  const org = orgItems.find((item) => item.id === orgId) ?? null;

  const members = useOrgMembers(orgId, {
    q: query || undefined,
    status: bucket === "all" ? undefined : bucket,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const items = members.data?.items ?? [];
  const total = members.data?.total ?? 0;
  const counts: [string, number][] = (members.data?.counts ?? []).map(
    (entry): [string, number] => [entry.bucket, entry.count],
  );
  const viewerRole = members.data?.viewer_role ?? "member";
  const manager = viewerRole === "owner" || viewerRole === "admin";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = members.data !== undefined && page > totalPages;
  const filtering = query.trim() !== "" || bucket !== "all";

  const listRef = useRiseOn<HTMLUListElement>(`${current}:${items.length}`);

  // Live roster: another tab or manager mutating members refreshes here
  // and raises a toast (selfId suppresses echoes of the viewer's own acts).
  useMemberRealtime(orgId, session.data?.id);

  // Default ?org= to the first org so the URL is always shareable.
  useEffect(() => {
    if (orgParam === null && orgId !== null) {
      updateParams({ org: orgId }, true);
    }
  }, [orgParam, orgId, updateParams]);

  // Drop an unknown ?org= once the org list has loaded.
  const firstOrgId = orgItems[0]?.id ?? null;
  useEffect(() => {
    if (orgParam !== null && orgs.data !== undefined && org === null && firstOrgId !== null) {
      updateParams(
        { org: firstOrgId, q: null, status: null, sort: null, page: null, invite: null },
        true,
      );
    }
  }, [orgParam, orgs.data, org, firstOrgId, updateParams]);

  // Pull an out-of-range ?page= back once totals arrive.
  useEffect(() => {
    if (members.data !== undefined && page > totalPages) {
      updateParams({ page: totalPages > 1 ? String(totalPages) : null }, true);
    }
  }, [members.data, page, totalPages, updateParams]);

  function resetFilters(): void {
    updateParams({ q: null, status: null, sort: null, page: null }, true);
  }

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div data-rise className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FiUsers className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Thành viên
          </h3>
          {members.data && total > 0 && (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {total}
            </span>
          )}
        </div>
        {org && (
          <MemberManageActions
            org={org}
            selfId={session.data?.id}
            canInvite={manager}
            inviting={inviting}
            onToggleInvite={() => updateParams({ invite: inviting ? null : "1" })}
          />
        )}
      </div>
      {orgItems.length > 0 && (
        <MemberOrgPicker
          orgs={orgItems}
          selectedId={orgId}
          onSelect={(id) => updateParams({ org: id, q: null, status: null, sort: null, page: null, invite: null })}
        />
      )}
      {orgId !== null && (
        <MemberInviteModal
          orgId={orgId}
          canAssignAdmin={viewerRole === "owner"}
          open={inviting && manager}
          onClose={() => updateParams({ invite: null })}
        />
      )}
      {orgItems.length > 0 && (total > 0 || filtering) && (
        <MemberListToolbar
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
      <div className="mt-3" aria-live="polite" aria-busy={orgs.isPending || members.isPending}>
        {orgs.isPending && <LoadingState label="Đang tải tổ chức…" />}
        {orgs.isError && (
          <ErrorState
            title="Không tải được tổ chức"
            message={toVietnameseDashboardMessage(
              orgs.error instanceof ApiError ? orgs.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {orgs.data && orgItems.length === 0 && (
          <>
            <EmptyState
              title="Chưa có tổ chức nào"
              message="Tạo tổ chức trước, rồi mời và quản lý thành viên tại đây."
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
        {orgs.data && orgItems.length > 0 && members.isPending && (
          <LoadingState label="Đang tải danh sách thành viên…" />
        )}
        {members.isError && (
          <ErrorState
            title="Không tải được thành viên"
            message={toVietnameseDashboardMessage(
              members.error instanceof ApiError ? members.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {members.data && filtering && total === 0 && !outOfRange && (
          <EmptyState
            title="Không có thành viên phù hợp"
            message="Thử từ khóa khác hoặc xóa bộ lọc để xem toàn bộ."
            actionLabel="Xóa bộ lọc"
            onAction={resetFilters}
          />
        )}
        {members.data && !filtering && total === 0 && !outOfRange && (
          <EmptyState
            title="Chưa có thành viên nào"
            message="Mời thành viên bằng email, hoặc mở gia nhập để mọi người tự tham gia."
          />
        )}
        {outOfRange && <LoadingState label="Đang tải danh sách thành viên…" />}
        {!outOfRange && items.length > 0 && orgId !== null && (
          <>
            <ul ref={listRef} className="flex flex-col gap-3">
              {items.map((member) => (
                <MemberRow
                  key={member.user_id}
                  orgId={orgId}
                  member={member}
                  viewerRole={viewerRole}
                  selfId={session.data?.id}
                />
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {`Trang ${current} / ${totalPages} · ${total} thành viên`}
              </p>
              <Pagination
                page={current}
                totalPages={totalPages}
                onPage={(n) => updateParams({ page: n > 1 ? String(n) : null })}
              />
            </div>
          </>
        )}
      </div>
    </BentoCard>
  );
}
