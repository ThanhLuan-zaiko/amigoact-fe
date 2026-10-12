import { useCallback, useMemo } from "react";
import type { ReactElement } from "react";
import { FiUsers } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { ApiError } from "../../core/api.ts";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import { useRiseOn } from "../../core/motion.ts";
import { useSession } from "../../auth/hooks.ts";
import { useMyOrgs } from "../hooks.ts";
import {
  useMemberParamSync,
  useMemberRealtime,
  useOrgMembers,
  useOrgRoles,
} from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { MemberSortParam } from "../members-api.ts";
import { MemberInviteModal } from "./MemberInviteModal.tsx";
import { MemberListToolbar } from "./MemberListToolbar.tsx";
import { MemberManageActions } from "./MemberManageActions.tsx";
import { MemberNoOrg } from "./MemberNoOrg.tsx";
import { MemberOrgPicker } from "./MemberOrgPicker.tsx";
import { MemberRow } from "./MemberRow.tsx";
import { RoleManageCard } from "./RoleManageCard.tsx";

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
  const orgRoles = useOrgRoles(orgId);

  const items = members.data?.items ?? [];
  const total = members.data?.total ?? 0;
  const counts: [string, number][] = (members.data?.counts ?? []).map(
    (entry): [string, number] => [entry.bucket, entry.count],
  );
  const viewerRole = members.data?.viewer_role ?? "member";
  const viewerPermissions = useMemo(
    () => members.data?.viewer_permissions ?? [],
    [members.data],
  );
  // member:invite gates the invite affordance; owner always passes.
  const canInvite =
    viewerRole === "owner" || viewerPermissions.includes("member:invite");
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = members.data !== undefined && page > totalPages;
  const filtering = query.trim() !== "" || bucket !== "all";

  const listRef = useRiseOn<HTMLUListElement>(`${current}:${items.length}`);

  // Live roster: another tab or manager mutating members refreshes here
  // and raises a toast (selfId suppresses echoes of the viewer's own acts).
  useMemberRealtime(orgId, session.data?.id);

  useMemberParamSync({
    updateParams,
    orgParam,
    orgId,
    orgKnown: orgs.data !== undefined,
    orgFound: org !== null,
    firstOrgId: orgItems[0]?.id ?? null,
    hasMembersData: members.data !== undefined,
    page,
    totalPages,
  });

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
            canInvite={canInvite}
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
          viewerRole={viewerRole}
          viewerPermissions={viewerPermissions}
          orgRoles={orgRoles.data?.items ?? []}
          open={inviting && canInvite}
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
        {orgs.data && orgItems.length === 0 && <MemberNoOrg />}
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
                  viewerPermissions={viewerPermissions}
                  orgRoles={orgRoles.data?.items ?? []}
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
      {orgId !== null && orgItems.length > 0 && (
        <RoleManageCard
          orgId={orgId}
          viewerRole={viewerRole}
          viewerPermissions={viewerPermissions}
        />
      )}
    </BentoCard>
  );
}
