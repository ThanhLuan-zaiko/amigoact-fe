import type { ReactElement } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useSession } from "../../auth/hooks.ts";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { DeskCard } from "../../workspace/components/DeskCard.tsx";
import { ShelfRail } from "../../workspace/components/ShelfRail.tsx";
import { ShelfTabs } from "../../workspace/components/ShelfTabs.tsx";
import type { ArticleShelf } from "../../workspace/components/ArticleActions.tsx";
import type { DashboardOrg } from "../api.ts";
import { useOrgRoles, useOrgMembers } from "../members-hooks.ts";
import type { MemberSortParam } from "../members-api.ts";
import { MemberOrgCard } from "./MemberOrgCard.tsx";
import { MemberStatsCard } from "./MemberStatsCard.tsx";
import { RoleManageCard } from "./RoleManageCard.tsx";

const MEMBER_SORTS = ["newest", "name", "role"] as const;
const PAGE_SIZE = 10;

function memberPage(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function shelfOf(raw: string | null): ArticleShelf {
  return raw === "draft" || raw === "trash" ? raw : "published";
}

// Member filters, custom roles, and the board shelf live in the manage
// rail. Query keys match the center page so the roster is not fetched twice.
export function ManageContextPanels({
  orgId,
  org,
}: {
  orgId: string | null;
  org: DashboardOrg | null;
}): ReactElement | null {
  const { pathname } = useLocation();
  const session = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const onMembers = pathname.startsWith("/manage/members");
  const onBoard = pathname === "/manage/board";
  const query = searchParams.get("q") ?? "";
  const bucket = searchParams.get("status") ?? "all";
  const sortParam = searchParams.get("sort") ?? "newest";
  const sort: MemberSortParam = (MEMBER_SORTS as readonly string[]).includes(sortParam)
    ? (sortParam as MemberSortParam)
    : "newest";
  const page = memberPage(searchParams.get("page"));
  const members = useOrgMembers(onMembers ? orgId : null, {
    q: query || undefined,
    status: bucket === "all" ? undefined : bucket,
    sort,
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });
  const roles = useOrgRoles(onMembers ? orgId : null);
  if (!onMembers && !onBoard) return null;
  if (orgId === null) return null;

  const viewerRole = members.data?.viewer_role ?? "member";
  const viewerPermissions = members.data?.viewer_permissions ?? [];
  const tab = shelfOf(searchParams.get("tab"));
  const writeHref = `/manage/board/write?org=${orgId}`;

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

  if (onBoard) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <ShelfTabs
            tab={tab}
            onSelect={(shelf) =>
              patch({
                tab: shelf === "published" ? null : shelf,
                kind: null,
                page: null,
              })
            }
          />
        </div>
        {tab === "trash" ? (
          <ShelfRail shelf="trash" writeHref={writeHref} />
        ) : (
          <DeskCard writeHref={writeHref} />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <MemberStatsCard
        compact
        pending={members.data === undefined}
        errorCode={
          members.isError
            ? members.error instanceof ApiError
              ? members.error.code
              : "REQUEST_FAILED"
            : null
        }
        counts={members.data?.counts ?? []}
        bucket={bucket}
        onBucket={(key) => patch({ status: key === "all" ? null : key, page: null })}
      />
      <MemberOrgCard
        org={org}
        orgId={orgId}
        selfId={session.data?.id}
        canInvite={
          viewerRole === "owner" || viewerPermissions.includes("member:invite")
        }
        inviting={searchParams.get("invite") === "1"}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        orgRoles={roles.data?.items ?? []}
        onCloseInvite={() => patch({ invite: null })}
      />
      <Section>
        <RoleManageCard
          orgId={orgId}
          viewerRole={viewerRole}
          viewerPermissions={viewerPermissions}
        />
      </Section>
    </div>
  );
}
