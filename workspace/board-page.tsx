import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiChevronDown, FiFilter } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useSession } from "../auth/hooks.ts";
import { useMyMemberships } from "../dashboard/members-hooks.ts";
import { useOrgPosts, useWorkspaceOrg } from "./hooks.ts";
import { useBoardRealtime } from "./realtime-hooks.ts";
import type { PostKind } from "./api.ts";
import {
  POST_KIND_LABELS,
  toVietnameseWorkspaceMessage,
} from "./messages.tsx";
import { WorkspaceOrgBar } from "./components/WorkspaceOrgBar.tsx";
import { PostComposer } from "./components/PostComposer.tsx";
import { PostCard } from "./components/PostCard.tsx";

const KIND_FILTERS: { value: PostKind | ""; label: string }[] = [
  { value: "", label: "Tất cả" },
  { value: "discussion", label: POST_KIND_LABELS["discussion"] },
  { value: "announcement", label: POST_KIND_LABELS["announcement"] },
];

const CONTENT_SPAN = "col-span-1 md:col-span-6 lg:col-span-8";

// Org bulletin board (/manage/board?org=<id>[&kind=<kind>]): composer,
// pinned section, paged feed and comment threads, refreshed live through
// the posts:{org} channel.
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
  const { orgId, selectOrg } = useWorkspaceOrg(orgs);
  const [searchParams, setSearchParams] = useSearchParams();
  const kindParam = searchParams.get("kind");
  const kind: PostKind | undefined =
    kindParam === "announcement" || kindParam === "discussion"
      ? kindParam
      : undefined;
  const feed = useOrgPosts(orgId, kind);
  useBoardRealtime(orgId, selfId);
  const [openPostId, setOpenPostId] = useState<string | null>(null);

  const firstPage = feed.data?.pages[0];
  const permissions = firstPage?.viewer_permissions ?? [];
  const canAnnounce = permissions.includes("post:announce");
  const canManage = permissions.includes("post:manage");
  const pinned = firstPage?.pinned ?? [];
  const pinnedIds = new Set(pinned.map((post) => post.post_id));
  const items = (feed.data?.pages ?? [])
    .flatMap((page) => page.items)
    .filter((post) => !pinnedIds.has(post.post_id));

  function setKind(next: PostKind | ""): void {
    const params = new URLSearchParams(searchParams);
    if (next === "") params.delete("kind");
    else params.set("kind", next);
    setSearchParams(params, { replace: true });
  }

  function renderPost(post: (typeof items)[number]): ReactElement {
    return (
      <PostCard
        key={post.post_id}
        orgId={orgId as string}
        post={post}
        selfId={selfId}
        canManage={canManage}
        open={openPostId === post.post_id}
        onToggleComments={() =>
          setOpenPostId((cur) => (cur === post.post_id ? null : post.post_id))
        }
      />
    );
  }

  return (
    <>
      <WorkspaceOrgBar
        orgs={memberships.data === undefined ? undefined : orgs}
        orgId={orgId}
        title="Bảng tin tổ chức"
        onSelect={selectOrg}
      />
      {orgId !== null && (
        <>
          <PostComposer orgId={orgId} canAnnounce={canAnnounce} />
          <BentoCard className="md:col-span-6 lg:col-span-8">
            <div data-rise className="flex flex-wrap items-center gap-2">
              <FiFilter
                className="h-4 w-4 text-zinc-500 dark:text-zinc-400"
                aria-hidden="true"
              />
              {KIND_FILTERS.map((filter) => (
                <Button
                  key={filter.value || "all"}
                  type="button"
                  variant={
                    (kind ?? "") === filter.value ? "primary" : "secondary"
                  }
                  onClick={() => setKind(filter.value)}
                  aria-pressed={(kind ?? "") === filter.value}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </BentoCard>
          {feed.isPending && (
            <div className={CONTENT_SPAN}>
              <LoadingState label="Đang tải bảng tin…" />
            </div>
          )}
          {feed.isError && (
            <div className={CONTENT_SPAN}>
              <ErrorState
                title="Không tải được bảng tin"
                message={toVietnameseWorkspaceMessage(
                  feed.error instanceof ApiError
                    ? feed.error.code
                    : "REQUEST_FAILED",
                )}
                actionLabel="Thử lại"
                onAction={() => void feed.refetch()}
              />
            </div>
          )}
          {feed.data !== undefined &&
            pinned.length === 0 &&
            items.length === 0 && (
              <div className={CONTENT_SPAN}>
                <EmptyState
                  title="Chưa có bài viết nào"
                  message="Bảng tin đang trống. Hãy đăng bài đầu tiên cho tổ chức."
                />
              </div>
            )}
          {pinned.map(renderPost)}
          {items.map(renderPost)}
          {feed.hasNextPage && (
            <div className={CONTENT_SPAN}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => void feed.fetchNextPage()}
                disabled={feed.isFetchingNextPage}
                icon={<FiChevronDown className="h-4 w-4" aria-hidden="true" />}
              >
                {feed.isFetchingNextPage ? "Đang tải…" : "Xem bài cũ hơn"}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
