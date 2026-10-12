import { useEffect, useMemo } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiEdit3 } from "react-icons/fi";
import { Button } from "../core/components/Button.tsx";
import { useSession } from "../auth/hooks.ts";
import { useMyMemberships } from "../dashboard/members-hooks.ts";
import {
  POST_PAGE_SIZE,
  SHELF_PAGE_SIZE,
  useOrgPosts,
  usePostShelf,
  useWorkspaceOrg,
} from "./hooks.ts";
import { useBoardRealtime } from "./realtime-hooks.ts";
import type { PostKind } from "./board-api.ts";
import type { ArticleShelf } from "./components/ArticleActions.tsx";
import { WorkspaceOrgBar } from "./components/WorkspaceOrgBar.tsx";
import { ShelfTabs } from "./components/ShelfTabs.tsx";
import { FeedShelf } from "./components/FeedShelf.tsx";
import { ShelfCard } from "./components/ShelfCard.tsx";
import { ShelfRail } from "./components/ShelfRail.tsx";

function parseTab(raw: string | null): ArticleShelf {
  return raw === "draft" || raw === "trash" ? raw : "published";
}

// Org article workspace (/manage/board?org=<id>[&tab=&kind=]): shelf picker
// tiles, the pinned feature rail + magazine card grid, private drafts and
// the trash shelf with the same lifecycle actions as /manage/orgs.
export function WorkspaceBoardPage(): ReactElement {
  const session = useSession();
  const selfId = session.data?.id;
  const memberships = useMyMemberships("active", session.data != null);
  const orgs = useMemo(
    () =>
      (memberships.data?.items ?? []).map((item) => ({
        id: item.org_id,
        name: item.org_name,
      })),
    [memberships.data],
  );
  const { orgId } = useWorkspaceOrg(orgs);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseTab(searchParams.get("tab"));
  const kindParam = searchParams.get("kind");
  const kind: PostKind | undefined =
    kindParam === "announcement" || kindParam === "discussion"
      ? kindParam
      : undefined;
  const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const feed = useOrgPosts(orgId, kind, page);
  const drafts = usePostShelf(orgId, "drafts", page, tab === "draft");
  const trash = usePostShelf(orgId, "trash", page, tab === "trash");
  useBoardRealtime(orgId, selfId);

  const activePage =
    tab === "draft" ? drafts : tab === "trash" ? trash : feed;
  const pageSize = tab === "published" ? POST_PAGE_SIZE : SHELF_PAGE_SIZE;
  const totalPages = Math.max(
    1,
    Math.ceil((activePage.data?.total ?? 0) / pageSize),
  );

  // Pull an out-of-range ?page= back once totals arrive.
  useEffect(() => {
    if (activePage.data !== undefined && page > totalPages) {
      const next = new URLSearchParams(searchParams);
      if (totalPages > 1) next.set("page", String(totalPages));
      else next.delete("page");
      setSearchParams(next, { replace: true });
    }
  }, [activePage.data, page, totalPages, searchParams, setSearchParams]);

  const permissions =
    feed.data?.viewer_permissions ??
    drafts.data?.viewer_permissions ??
    trash.data?.viewer_permissions ??
    [];
  const canAnnounce = permissions.includes("post:announce");
  const canManage = permissions.includes("post:manage");
  const writeHref =
    orgId === null ? "/manage/board" : `/manage/board/write?org=${orgId}`;

  function patchParams(patch: Record<string, string | null>): void {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }

  function selectOrgAndReset(id: string): void {
    const next = new URLSearchParams(searchParams);
    next.set("org", id);
    next.delete("page");
    setSearchParams(next, { replace: true });
  }

  return (
    <>
      <WorkspaceOrgBar
        orgs={memberships.data === undefined ? undefined : orgs}
        orgId={orgId}
        title="Bảng tin tổ chức"
        onSelect={selectOrgAndReset}
        trailing={
          orgId !== null ? (
            <Button
              to={writeHref}
              variant="primary"
              icon={<FiEdit3 className="h-4 w-4" aria-hidden="true" />}
            >
              Viết bài
            </Button>
          ) : undefined
        }
      />
      {orgId !== null && (
        <>
          <ShelfTabs
            tab={tab}
            onSelect={(shelf) =>
              patchParams({
                tab: shelf === "published" ? null : shelf,
                kind: null,
                page: null,
              })
            }
          />
          {tab === "published" && (
            <FeedShelf
              orgId={orgId}
              selfId={selfId}
              canManage={canManage}
              canAnnounce={canAnnounce}
              feed={feed}
              kind={kind}
              onKind={(value) =>
                patchParams({
                  kind: value === undefined ? null : value,
                  page: null,
                })
              }
              page={page}
              totalPages={totalPages}
              onPage={(n) =>
                patchParams({ page: n > 1 ? String(n) : null })
              }
              writeHref={writeHref}
            />
          )}
          {tab === "draft" && (
            <>
              <ShelfCard
                orgId={orgId}
                selfId={selfId}
                canManage={canManage}
                canAnnounce={canAnnounce}
                shelf="draft"
                query={drafts}
                page={page}
                totalPages={totalPages}
                onPage={(n) =>
                  patchParams({ page: n > 1 ? String(n) : null })
                }
                writeHref={writeHref}
              />
              <ShelfRail shelf="draft" writeHref={writeHref} />
            </>
          )}
          {tab === "trash" && (
            <>
              <ShelfCard
                orgId={orgId}
                selfId={selfId}
                canManage={canManage}
                canAnnounce={canAnnounce}
                shelf="trash"
                query={trash}
                page={page}
                totalPages={totalPages}
                onPage={(n) =>
                  patchParams({ page: n > 1 ? String(n) : null })
                }
                writeHref={writeHref}
              />
              <ShelfRail shelf="trash" writeHref={writeHref} />
            </>
          )}
        </>
      )}
    </>
  );
}
