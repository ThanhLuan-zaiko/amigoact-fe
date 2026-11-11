import Link from "next/link";
import type { ReactNode } from "react";
import { FiEdit3, FiGlobe, FiLock, FiMessageCircle } from "react-icons/fi";
import { postPath } from "@/lib/posts";
import PostBody from "./PostBody";
import type { Post } from "./types";
import { mutedText, panel, tagChip } from "./ui";

const MEDIA =
  "aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800";

const kindLabel: Record<Post["kind"], string> = {
  announcement: "Thông báo",
  discussion: "Thảo luận",
};

const visibilityLabel: Record<Post["visibility"], string> = {
  public: "Công khai",
  members: "Chỉ thành viên",
};

type PostCardProps = {
  post: Post;
  // Extra controls under the post, such as publishing a draft.
  actions?: ReactNode;
  // On the post page itself the title is not a link.
  linked?: boolean;
};

export default function PostCard({
  post,
  actions,
  linked = true,
}: PostCardProps) {
  // A draft opens its edit form. A published post opens its own page.
  const href =
    post.status === "draft"
      ? `${postPath(post.slug, post.id)}/edit`
      : postPath(post.slug, post.id);
  const isAnnouncement = post.kind === "announcement";
  const VisibilityIcon = post.visibility === "public" ? FiGlobe : FiLock;

  return (
    <article
      className={`${panel} flex flex-col gap-3 p-4 ${
        post.pinned ? "border-teal-700 dark:border-teal-400" : ""
      }`}
    >
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
          {post.organizationInitials}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/organizations/${post.slug}`}
            className="block truncate font-semibold hover:text-teal-700 dark:hover:text-teal-400"
          >
            {post.organizationName}
          </Link>
          <p className={`${mutedText} flex items-center gap-2`}>
            {post.publishedAt}
            <VisibilityIcon aria-hidden="true" />
            {visibilityLabel[post.visibility]}
            {post.edited ? (
              <span className="inline-flex items-center gap-1" title="Đã sửa">
                <FiEdit3 aria-hidden="true" />
                <span className="sr-only">Đã sửa</span>
              </span>
            ) : null}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-sm px-2 py-0.5 text-xs font-semibold ${
            isAnnouncement
              ? "border border-slate-300 text-slate-900 dark:border-slate-600 dark:text-slate-100"
              : "border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"
          }`}
        >
          {kindLabel[post.kind]}
        </span>
      </header>

      <h2 className="text-lg leading-snug font-bold break-words">
        {linked ? (
          <Link
            href={href}
            className="hover:text-teal-700 dark:hover:text-teal-400"
          >
            {post.title}
          </Link>
        ) : (
          post.title
        )}
      </h2>
      <PostBody body={post.body} />
      {post.media && post.media.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {post.media.map(({ src, isVideo }) => (
            <li key={src}>
              {isVideo ? (
                // biome-ignore lint/a11y/useMediaCaption: uploads come without captions.
                <video
                  src={src}
                  controls
                  preload="metadata"
                  className={MEDIA}
                />
              ) : (
                // biome-ignore lint/performance/noImgElement: served by the media route.
                <img src={src} alt="" loading="lazy" className={MEDIA} />
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        {post.tags.map((tag) => (
          <span key={tag} className={tagChip}>
            #{tag}
          </span>
        ))}
        <span
          className={`${mutedText} ml-auto flex items-center gap-2`}
          title="Bình luận"
        >
          <FiMessageCircle aria-hidden="true" />
          {post.commentCount}
          <span className="sr-only">bình luận</span>
        </span>
      </footer>
      {actions}
    </article>
  );
}
