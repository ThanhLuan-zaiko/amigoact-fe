import type { ReactElement } from "react";
import { FiBookmark, FiMessageCircle } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import {
  articleBlocks,
  coverUrl,
  excerpt,
  readingMinutes,
  wordCount,
} from "../article.ts";
import type { OrgPost } from "../board-api.ts";
import {
  formatTime,
  POST_KIND_LABELS,
  readingTimeLabel,
} from "../messages.tsx";
import { ArticleActions } from "./ArticleActions.tsx";

interface ArticleCardProps {
  orgId: string;
  post: OrgPost;
  selfId?: string;
  canManage: boolean;
  canAnnounce: boolean;
  // Pinned rail renders one wide feature card instead of a grid tile.
  featured?: boolean;
}

// Newspaper-style article tile: cover, kind/status badges, title, lead
// excerpt, byline and the lifecycle action row from ArticleActions.
export function ArticleCard({
  orgId,
  post,
  selfId,
  canManage,
  canAnnounce,
  featured = false,
}: ArticleCardProps): ReactElement {
  const cover = coverUrl(post);
  const pinned = post.pinned_at !== null;
  const span = featured
    ? "md:col-span-6 lg:col-span-12"
    : "md:col-span-3 lg:col-span-4";
  return (
    <BentoCard className={span}>
      <article data-rise className={featured ? "flex flex-col gap-4 sm:flex-row" : ""}>
        {cover !== null && (
          <img
            src={cover}
            alt={post.title.trim() || "Ảnh bìa bài viết"}
            loading="lazy"
            className={
              featured
                ? "aspect-video w-full rounded-xl border border-zinc-200 object-cover sm:w-2/5 dark:border-zinc-800"
                : "aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
            }
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {post.kind === "announcement" && (
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                {POST_KIND_LABELS[post.kind]}
              </span>
            )}
            {pinned && (
              <span className="inline-flex items-center gap-1 rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-semibold text-zinc-950 dark:border-brand/30 dark:bg-brand/10 dark:text-brand">
                <FiBookmark className="h-3.5 w-3.5" aria-hidden="true" />
                Đã ghim
              </span>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {post.author_name} · {formatTime(post.published_at ?? post.created_at)}
              {post.edited_at !== null && " · đã chỉnh sửa"}
            </p>
          </div>
          {post.title.trim() !== "" && (
            <h3 className="mt-2 text-base font-semibold break-words text-zinc-900 sm:text-lg dark:text-zinc-100">
              {post.title}
            </h3>
          )}
          <p className="mt-1 text-sm break-words text-zinc-600 dark:text-zinc-400">
            {excerpt(post)}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            <span>
              {readingTimeLabel(
                readingMinutes(wordCount(articleBlocks(post))),
              )}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiMessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {post.comment_count}
            </span>
          </p>
          <div className="mt-3">
            <ArticleActions
              orgId={orgId}
              post={post}
              selfId={selfId}
              canManage={canManage}
              canAnnounce={canAnnounce}
              shelf="published"
            />
          </div>
        </div>
      </article>
    </BentoCard>
  );
}
