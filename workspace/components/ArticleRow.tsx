import type { BoardAbilities } from "../board-abilities.tsx";
import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { coverUrl, excerpt } from "../article.ts";
import type { OrgPost } from "../board-api.ts";
import {
  formatTime,
  POST_KIND_LABELS,
  POST_VISIBILITY_LABELS,
  postStatusLabel,
} from "../messages.tsx";
import { ArticleActions, type ArticleShelf } from "./ArticleActions.tsx";

interface ArticleRowProps {
  orgId: string;
  post: OrgPost;
  selfId?: string;
  abilities: BoardAbilities;
  shelf: ArticleShelf;
}

// Compact article row for the drafts/trash shelves: small cover thumb,
// title + badges + one-line excerpt, and the shelf lifecycle actions.
export function ArticleRow({
  orgId,
  post,
  selfId,
  abilities,
  shelf,
}: ArticleRowProps): ReactElement {
  const cover = coverUrl(post);
  const stamp = shelf === "trash" ? post.deleted_at : post.updated_at;
  return (
    <li
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 sm:flex-row sm:items-start dark:border-zinc-800"
    >
      {cover !== null && (
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="aspect-video w-full rounded-lg border border-zinc-200 object-cover sm:w-28 dark:border-zinc-800"
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {postStatusLabel(post)}
          </span>
          {post.kind === "announcement" && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
              {POST_KIND_LABELS[post.kind]}
            </span>
          )}
          {post.status === "published" && post.visibility === "members" && (
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              {POST_VISIBILITY_LABELS.members}
            </span>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {shelf === "trash" ? "Đã xóa" : "Cập nhật"} {formatTime(stamp)}
          </p>
          {post.revision_of !== null && (
            <Link
              to={`/manage/board/post?org=${orgId}&post=${post.revision_of}`}
              className="text-xs text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:decoration-zinc-600 dark:hover:text-zinc-200 dark:focus-visible:outline-zinc-400"
            >
              Xem bài đang hiển thị
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm font-semibold break-words text-zinc-900 dark:text-zinc-100">
          {post.title.trim() !== "" ? post.title : "(Chưa có tiêu đề)"}
        </p>
        <p className="mt-0.5 text-xs break-words text-zinc-500 dark:text-zinc-400">
          {excerpt(post, 120)}
        </p>
        <div className="mt-2">
          <ArticleActions
            orgId={orgId}
            post={post}
            selfId={selfId}
            abilities={abilities}
            shelf={shelf}
          />
        </div>
      </div>
    </li>
  );
}
