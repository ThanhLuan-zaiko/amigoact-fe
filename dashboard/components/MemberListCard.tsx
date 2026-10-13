import type { ReactElement } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { Pagination } from "../../core/components/Pagination.tsx";
import { useRiseOn } from "../../core/motion.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { MemberListPage, MemberSortParam, OrgRole } from "../members-api.ts";
import type { OrgListPage } from "../api.ts";
import { MemberListToolbar } from "./MemberListToolbar.tsx";
import { MemberNoOrg } from "./MemberNoOrg.tsx";
import { MemberRow } from "./MemberRow.tsx";

interface MemberListCardProps {
  orgs: UseQueryResult<OrgListPage, ApiError>;
  members: UseQueryResult<MemberListPage, ApiError>;
  orgId: string | null;
  orgRoles: OrgRole[];
  selfId: string | undefined;
  onlineIds: ReadonlySet<string>;
  query: string;
  sort: MemberSortParam;
  filtering: boolean;
  outOfRange: boolean;
  page: number;
  totalPages: number;
  onQuery: (value: string) => void;
  onSort: (sort: MemberSortParam) => void;
  onPage: (page: number) => void;
  onResetFilters: () => void;
}

// The wide roster tile: header, compact toolbar, divided member rows and
// pagination. Filter state lives in the page so the URL stays the source.
export function MemberListCard({
  orgs,
  members,
  orgId,
  orgRoles,
  selfId,
  onlineIds,
  query,
  sort,
  filtering,
  outOfRange,
  page,
  totalPages,
  onQuery,
  onSort,
  onPage,
  onResetFilters,
}: MemberListCardProps): ReactElement {
  const hasOrgs = (orgs.data?.items.length ?? 0) > 0;
  const items = members.data?.items ?? [];
  const total = members.data?.total ?? 0;
  const viewerRole = members.data?.viewer_role ?? "member";
  const viewerPermissions = members.data?.viewer_permissions ?? [];

  const listRef = useRiseOn<HTMLUListElement>(`${page}:${items.length}`);

  return (
    <Section
      className={
        hasOrgs
          ? " "
          : " "
      }
    >
      <div data-rise className="flex items-center gap-2">
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
      {hasOrgs && (total > 0 || filtering) && (
        <MemberListToolbar
          query={query}
          onQuery={onQuery}
          sort={sort}
          onSort={onSort}
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
        {orgs.data && !hasOrgs && <MemberNoOrg />}
        {hasOrgs && members.isPending && (
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
            onAction={onResetFilters}
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
            <ul
              ref={listRef}
              className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800"
            >
              {items.map((member) => (
                <MemberRow
                  key={member.user_id}
                  orgId={orgId}
                  member={member}
                  viewerRole={viewerRole}
                  viewerPermissions={viewerPermissions}
                  orgRoles={orgRoles}
                  selfId={selfId}
                  online={onlineIds.has(member.user_id)}
                />
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {`Trang ${page} / ${totalPages} · ${total} thành viên`}
              </p>
              <Pagination page={page} totalPages={totalPages} onPage={onPage} />
            </div>
          </>
        )}
      </div>
    </Section>
  );
}
