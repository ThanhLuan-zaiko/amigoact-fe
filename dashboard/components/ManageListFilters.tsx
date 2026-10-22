import type { ReactElement } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMyOrgs } from "../hooks.ts";
import type { MemberSortParam } from "../members-api.ts";
import { MemberListToolbar } from "./MemberListToolbar.tsx";
import { OrgListToolbar, type OrgSort } from "./OrgListToolbar.tsx";

const ORG_SORTS = ["newest", "name", "members"] as const;
const MEMBER_SORTS = ["newest", "name", "role"] as const;
const PAGE_SIZE = 5;
const TRASH_LIMIT = 100;

function pageOf(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

// Status and sort chips for the manage rail. The center list reads the
// same URL params, so the queries match the page cache.
export function ManageListFilters(): ReactElement | null {
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const onOrgs =
    (pathname.startsWith("/manage/overview") ||
      pathname.startsWith("/manage/orgs")) &&
    !pathname.startsWith("/manage/orgs/create");
  const onMembers = pathname.startsWith("/manage/members");
  const query = searchParams.get("q") ?? "";
  const bucket = searchParams.get("status") ?? "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const orgSort: OrgSort = (ORG_SORTS as readonly string[]).includes(sortParam)
    ? (sortParam as OrgSort)
    : "newest";
  const memberSort: MemberSortParam = (MEMBER_SORTS as readonly string[]).includes(
    sortParam,
  )
    ? (sortParam as MemberSortParam)
    : "newest";
  const page = pageOf(searchParams.get("page"));
  const trashView = bucket === "trash";
  const orgs = useMyOrgs(
    false,
    {
      q: query || undefined,
      status: bucket === "all" || trashView ? undefined : bucket,
      sort: orgSort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    },
    onOrgs,
  );
  const trash = useMyOrgs(true, { limit: TRASH_LIMIT }, onOrgs);
  if (!onOrgs && !onMembers) return null;

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

  const total = orgs.data?.total ?? 0;
  const counts: [string, number][] = (orgs.data?.counts ?? []).map(
    (entry): [string, number] => [entry.bucket, entry.count],
  );
  const trashed = (trash.data?.items ?? []).filter((org) => org.deleted_at !== null);
  const filtering = query.trim() !== "" || (bucket !== "all" && !trashView);
  const showOrgs = onOrgs && (total > 0 || filtering || trashed.length > 0);

  return (
    <div className="flex flex-col gap-3">
      {showOrgs && (
        <OrgListToolbar
          bucket={bucket}
          onBucket={(key) =>
            patch({ status: key === "all" ? null : key, page: null })
          }
          counts={counts}
          trashCount={trashed.length}
          sort={orgSort}
          onSort={(key) => patch({ sort: key === "newest" ? null : key, page: null })}
          total={total}
        />
      )}
      {onMembers && (
        <MemberListToolbar
          sort={memberSort}
          onSort={(key) => patch({ sort: key === "newest" ? null : key, page: null })}
        />
      )}
    </div>
  );
}
