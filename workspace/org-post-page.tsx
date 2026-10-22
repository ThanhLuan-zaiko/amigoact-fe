import type { ReactElement } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { ApiError } from "../core/api.ts";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { usePublicOrg } from "../orgs/hooks.ts";
import { orgMediaUrl } from "../orgs/api.ts";
import {
  articleBlocks,
  coverUrl,
  readingMinutes,
  wordCount,
} from "./article.ts";
import { usePublicOrgPost } from "./board-hooks.ts";
import {
  formatDay,
  formatTime,
  POST_KIND_LABELS,
  readingTimeLabel,
  toVietnameseWorkspaceMessage,
} from "./messages.tsx";
import { ArticleBody } from "./components/ArticleBody.tsx";

// Public announcement reader (/orgs/:slug/posts/:postId): guests see the
// full article without auth; comments and board controls stay member-only.
export function OrgPostPage(): ReactElement {
  const { slug, postId } = useParams();
  const navigate = useNavigate();
  const post = usePublicOrgPost(slug, postId);
  const org = usePublicOrg(slug);
  const profileHref = `/orgs/${slug ?? ""}`;
  const article = post.data ?? null;
  const cover = article === null ? null : coverUrl(article);

  return (
    <>
      <Section>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Tin tức từ tổ chức
          </h1>
          <Button
            to={profileHref}
            variant="secondary"
            icon={<FiArrowLeft className="h-4 w-4" aria-hidden="true" />}
          >
            Về trang tổ chức
          </Button>
        </div>
      </Section>
      {post.isPending && (
        <div>
          <LoadingState label="Đang tải bài viết…" />
        </div>
      )}
      {post.isError && (
        <div>
          <ErrorState
            title="Không mở được bài viết"
            message={
              post.error instanceof ApiError && post.error.status === 404
                ? "Bài viết này không tồn tại hoặc không còn hiển thị công khai."
                : toVietnameseWorkspaceMessage(
                    post.error instanceof ApiError
                      ? post.error.code
                      : "REQUEST_FAILED",
                  )
            }
            actionLabel="Về trang tổ chức"
            onAction={() => navigate(profileHref)}
          />
        </div>
      )}
      {article !== null && (
        <>
          <Section>
            <article>
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
          </Section>
          <Section>
            <div className="flex flex-col gap-3">
              {org.data !== undefined && (
                <Link
                  to={profileHref}
                  className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
                >
                  {org.data.logo_url !== null && (
                    <img
                      src={orgMediaUrl(org.data.logo_url)}
                      alt=""
                      className="h-6 w-6 rounded-full border border-zinc-200 object-cover dark:border-zinc-800"
                    />
                  )}
                  <span className="truncate">{org.data.name}</span>
                </Link>
              )}
              <dl className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between gap-2">
                  <dt>Tác giả</dt>
                  <dd className="font-medium text-zinc-900 dark:text-zinc-100">
                    {article.author_name}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Ngày đăng</dt>
                  <dd>{formatDay(article.published_at)}</dd>
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
            </div>
          </Section>
        </>
      )}
    </>
  );
}
