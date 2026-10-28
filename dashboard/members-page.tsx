import { useCallback } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../auth/hooks.ts";
import { useMyOrgs } from "./hooks.ts";
import {
  useMemberParamSync,
  useMemberRealtime,
  useOrgMembers,
  useOrgRoles,
} from "./members-hooks.ts";
import type { MemberSortParam } from "./members-api.ts";
import { useOrgPresence, usePresenceIds } from "./presence-hooks.ts";
import { InvitationInboxCard } from "./components/InvitationInboxCard.tsx";
import { MemberListCard } from "./components/MemberListCard.tsx";
import { hasPermission } from "./members-utils.ts";

const PAGE_SIZE = 10;
const ORG_LIMIT = 100;
const SORTS: readonly MemberSortParam[] = ["newest", "name", "role"];

function isSort(value: string): value is MemberSortParam {
  return (SORTS as readonly string[]).includes(value);
}

// Members board: stats strip on top, roster tile on the left, org context
// and custom roles stacked in the right rail.
export function DashboardMembersPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = useSession();

  // Filter state lives in the URL so every view is deep-linkable.
  const orgParam = searchParams.get("org");
  const query = searchParams.get("q") ?? "";
  const bucket = searchParams.get("status") ?? "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: MemberSortParam = isSort(sortParam) ? sortParam : "newest";
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

  const total = members.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const outOfRange = members.data !== undefined && page > totalPages;
  const filtering = query.trim() !== "" || bucket !== "all";

  // Live roster: another tab or manager mutating members refreshes here
  // and raises a toast (selfId suppresses echoes of the viewer's own acts).
  useMemberRealtime(orgId, session.data?.id);
  // Presence rides the same members:{org} channel (snapshot + online/offline
  // pushes); the online id set lands in the query cache for the roster.
  useOrgPresence(orgId);
  const onlineIds = usePresenceIds(orgId);

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
    <>
      <InvitationInboxCard />
      <MemberListCard
        orgs={orgs}
        members={members}
        orgId={orgId}
        orgRoles={orgRoles.data?.items ?? []}
        selfId={session.data?.id}
        onlineIds={onlineIds}
        filtering={filtering}
        outOfRange={outOfRange}
        page={current}
        totalPages={totalPages}
        onPage={(n) => updateParams({ page: n > 1 ? String(n) : null })}
        onResetFilters={resetFilters}
      />
    </>
  );
}
