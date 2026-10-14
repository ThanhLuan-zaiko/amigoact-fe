import { useMemo } from "react";
import type { ReactElement } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useSession } from "../auth/hooks.ts";
import { useMyMemberships } from "../dashboard/members-hooks.ts";
import { useOrgPost, useOrgPosts, useWorkspaceOrg } from "./hooks.ts";
import { toVietnameseWorkspaceMessage } from "./messages.tsx";
import { ArticleEditor } from "./components/ArticleEditor.tsx";

// Long-form writing desk (/manage/board/write?org=<id>[&post=<id>]):
// resolves the org like the board, loads the post when editing, and
// hands the block editor to ArticleEditor.
export function WorkspaceWritePage(): ReactElement {
  const session = useSession();
  const memberships = useMyMemberships("active", session.data != null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orgs = useMemo(
    () =>
      (memberships.data?.items ?? []).map((item) => ({
        id: item.org_id,
        name: item.org_name,
      })),
    [memberships.data],
  );
  const { orgId } = useWorkspaceOrg(orgs);
  const postId = searchParams.get("post");
  const post = useOrgPost(orgId, postId);
  const feed = useOrgPosts(orgId);
  const permissions = feed.data?.viewer_permissions ?? [];
  const canAnnounce = permissions.includes("post:announce");
  const orgName = orgs.find((org) => org.id === orgId)?.name ?? "";
  const boardHref = orgId === null ? "/manage/board" : `/manage/board?org=${orgId}`;
  // Wait for the feed envelope too: viewer_permissions decides the
  // default kind (announcement for managers) and the kind toggle state.
  const ready =
    (postId === null || post.data !== undefined) && !feed.isPending;

  return (
    <>
      <Section>
        <div data-rise className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiEdit3 className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
            <div>
              <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
                {postId === null ? "Viết bài mới" : "Chỉnh sửa bài viết"}
              </h1>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {orgName !== "" ? `Tổ chức: ${orgName}` : "Đang xác định tổ chức…"}
              </p>
            </div>
          </div>
          <Button
            to={boardHref}
            variant="secondary"
            icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Về bảng tin
          </Button>
        </div>
      </Section>
      {orgId === null && memberships.data !== undefined && (
        <div>
          <EmptyState
            title="Chưa có tổ chức"
            message="Bạn cần tham gia một tổ chức trước khi viết bài."
          />
        </div>
      )}
      {orgId !== null && !ready && !post.isError && (
        <div>
          <LoadingState
            label={
              postId === null
                ? "Đang chuẩn bị trang viết…"
                : "Đang tải bài viết…"
            }
          />
        </div>
      )}
      {orgId !== null && postId !== null && post.isError && (
        <div>
          <ErrorState
            title="Không mở được bài viết"
            message={toVietnameseWorkspaceMessage(
              post.error instanceof ApiError
                ? post.error.code
                : "REQUEST_FAILED",
            )}
            actionLabel="Về bảng tin"
            onAction={() => navigate(boardHref)}
          />
        </div>
      )}
      {orgId !== null && ready && (
        <ArticleEditor
          key={`${orgId}:${postId ?? "new"}`}
          orgId={orgId}
          initial={post.data ?? null}
          canAnnounce={canAnnounce}
          onPublished={(saved) =>
            navigate(`/manage/board/post?org=${orgId}&post=${saved.post_id}`)
          }
        />
      )}
    </>
  );
}
