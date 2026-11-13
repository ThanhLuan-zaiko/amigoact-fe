import Link from "next/link";
import type { ReactNode } from "react";
import {
  FiEdit3,
  FiEyeOff,
  FiGlobe,
  FiLock,
  FiMessageCircle,
} from "react-icons/fi";
import { placedMediaIds } from "@/lib/postMedia";
import { postPath } from "@/lib/posts";
import { orgTagHref } from "@/lib/tagLinks";
import PostBody from "./PostBody";
import PostMediaView from "./PostMediaView";
import PostPreview from "./PostPreview";
import PostActions from "./posts/PostActions";
import PostActivityRow from "./posts/PostActivityRow";
import type { Post } from "./types";
import { mutedText, panel, tagLink } from "./ui";

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
  // Edit, pin, hide and delete buttons. The home feed only reads posts, so it
  // turns them off; managers use the organization's own pages.
  manageable?: boolean;
};

export default function PostCard({
  post,
  actions,
  linked = true,
  manageable = true,
}: PostCardProps) {
  // A draft opens its edit form. A published post opens its own page.
  const href =
    post.status === "draft"
      ? `${postPath(post.slug, post.id)}/edit`
      : postPath(post.slug, post.id);
  const isAnnouncement = post.kind === "announcement";
  const VisibilityIcon = post.visibility === "public" ? FiGlobe : FiLock;
  // Files placed inside the body show there. The rest form a gallery after it.
  const placed = placedMediaIds(post.body);
  const gallery = (post.media ?? []).filter((item) => !placed.has(item.id));

  return (
    <article
      className={`${panel} flex flex-col gap-3 p-4 ${
        post.pinned ? "border-teal-700 dark:border-teal-400" : ""
      }`}
    >
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-xs font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
          {post.organizationInitials}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/org/${post.slug}`}
            className="block truncate font-semibold hover:text-teal-700 dark:hover:text-teal-400"
          >
            {post.organizationName}
          </Link>
          <p
            className={`${mutedText} flex flex-wrap items-center gap-x-2 gap-y-1`}
          >
            <span className="whitespace-nowrap">{post.publishedAt}</span>
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
        {post.hidden ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-sm bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
            title="Chỉ ban quản trị thấy bài này"
          >
            <FiEyeOff aria-hidden="true" />
            Đã ẩn
          </span>
        ) : null}
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

      <h2 className="text-base leading-snug font-bold break-words sm:text-lg">
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
      {linked ? (
        <PostPreview
          body={post.body}
          href={href}
          media={[
            ...[...placed].flatMap(
              (id) => post.media?.find((item) => item.id === id) ?? [],
            ),
            ...gallery,
          ]}
        />
      ) : (
        <PostBody body={post.body} media={post.media} />
      )}
      {!linked && gallery.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {gallery.map((item) => (
            <li key={item.id}>
              <PostMediaView item={item} tile />
            </li>
          ))}
        </ul>
      ) : null}

      {post.activity ? <PostActivityRow activity={post.activity} /> : null}

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={orgTagHref(post.slug, tag)}
            title="Xem bài cùng thẻ"
            className={tagLink}
          >
            #{tag}
          </Link>
        ))}
        <span
          className={`${mutedText} ml-auto flex items-center gap-2`}
          title="Bình luận"
        >
          <FiMessageCircle aria-hidden="true" />
          {post.commentCount}
          <span className="sr-only">bình luận</span>
        </span>
        {linked && manageable && !actions ? (
          <PostActions post={post} inline />
        ) : null}
      </footer>
      {actions}
    </article>
  );
}
