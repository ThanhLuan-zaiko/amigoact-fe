import { useMemo } from "react";
import type { ReactElement } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiBookmark, FiMessageCircle } from "react-icons/fi";
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
import {
  articleBlocks,
  coverUrl,
  readingMinutes,
  wordCount,
} from "./article.ts";
import { useOrgPost, useOrgPosts, useWorkspaceOrg } from "./hooks.ts";
import { useBoardRealtime } from "./realtime-hooks.ts";
import {
  formatTime,
  POST_KIND_LABELS,
  POST_VISIBILITY_LABELS,
  postStatusLabel,
  readingTimeLabel,
  toVietnameseWorkspaceMessage,
} from "./messages.tsx";
import { ArticleActions } from "./components/ArticleActions.tsx";
import { ArticleBody } from "./components/ArticleBody.tsx";
import { CommentThread } from "./components/CommentThread.tsx";

// Article reader (/manage/board/post?org=<id>&post=<id>): full-bleed
// article column with byline and comments, plus a meta/action rail.
export function WorkspaceReadPage(): ReactElement {
  const session = useSession();
  const selfId = session.data?.id;
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
  useBoardRealtime(orgId, selfId);
  const permissions = feed.data?.viewer_permissions ?? [];
  const canManage = permissions.includes("post:manage");
  const canAnnounce = permissions.includes("post:announce");
  const boardHref = orgId === null ? "/manage/board" : `/manage/board?org=${orgId}`;
  const article = post.data ?? null;
  const cover = article === null ? null : coverUrl(article);

  return (
    <>
      <Section>
        <div data-rise className="flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Đọc bài viết
          </h1>
          <Button
            to={boardHref}
            variant="secondary"
            icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Về bảng tin
          </Button>
        </div>
      </Section>
      {postId === null && (
        <div>
          <EmptyState
            title="Thiếu bài viết"
            message="Đường dẫn này không chứa bài viết nào."
          />
        </div>
      )}
      {postId !== null && post.isPending && (
        <div>
          <LoadingState label="Đang tải bài viết…" />
        </div>
      )}
      {postId !== null && post.isError && (
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
      {orgId !== null && article !== null && (
        <>
          <Section>
            <article data-rise>
              {cover !== null && (
                <img
                  src={cover}
                  alt={article.title.trim() || "Ảnh bìa bài viết"}
                  className="aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
                />
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {article.kind === "announcement" && (
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                    {POST_KIND_LABELS[article.kind]}
                  </span>
                )}
                {article.status === "published" &&
                  article.visibility === "members" && (
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      {POST_VISIBILITY_LABELS.members}
                    </span>
                  )}
                {article.status === "draft" && (
                  <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    {postStatusLabel(article)}
                  </span>
                )}
                {article.pinned_at !== null && (
                  <FiBookmark
                    className="h-4 w-4 text-zinc-900 dark:text-zinc-100"
                    aria-label="Bài viết đã ghim"
                  />
                )}
              </div>
              {article.title.trim() !== "" && (
                <h2 className="mt-2 text-2xl font-semibold tracking-tight break-words text-zinc-900 sm:text-3xl dark:text-zinc-100">
                  {article.title}
                </h2>
              )}
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {article.author_name} ·{" "}
                {formatTime(article.published_at ?? article.updated_at)}
                {article.edited_at !== null && " · đã chỉnh sửa"}
              </p>
              <ArticleBody post={article} />
            </article>
            {article.status === "published" && orgId !== null && (
              <CommentThread
                orgId={orgId}
                postId={article.post_id}
                selfId={selfId}
                canManage={canManage}
              />
            )}
          </Section>
          <Section>
            <div data-rise className="flex flex-col gap-3">
              <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
                Thông tin bài viết
              </h2>
              <dl className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between gap-2">
                  <dt>Tác giả</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {article.author_name}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Trạng thái</dt>
                  <dd>
                    {article.deleted_at !== null
                      ? "Đang ở thùng rác"
                      : postStatusLabel(article)}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Thời gian đọc</dt>
                  <dd>
                    {readingTimeLabel(
                      readingMinutes(wordCount(articleBlocks(article))),
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="inline-flex items-center gap-1">
                    <FiMessageCircle className="h-4 w-4" aria-hidden="true" />
                    Bình luận
                  </dt>
                  <dd>{article.comment_count}</dd>
                </div>
              </dl>
              <ArticleActions
                orgId={orgId}
                post={article}
                selfId={selfId}
                canManage={canManage}
                canAnnounce={canAnnounce}
                shelf={
                  article.deleted_at !== null ? "trash" : article.status
                }
                onDone={() => navigate(boardHref)}
              />
            </div>
          </Section>
        </>
      )}
    </>
  );
}
