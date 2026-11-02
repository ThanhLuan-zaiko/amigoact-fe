import { FiGlobe, FiLock, FiMessageCircle } from "react-icons/fi";
import type { Post } from "./types";
import { mutedText, panel, tagChip } from "./ui";

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
};

export default function PostCard({ post }: PostCardProps) {
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
          <p className="truncate font-semibold">{post.organizationName}</p>
          <p className={`${mutedText} flex items-center gap-2`}>
            {post.publishedAt}
            <VisibilityIcon aria-hidden="true" />
            {visibilityLabel[post.visibility]}
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

      <h2 className="text-lg leading-snug font-bold">{post.title}</h2>
      <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {post.body}
      </p>

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
        {post.tags.map((tag) => (
          <span key={tag} className={tagChip}>
            #{tag}
          </span>
        ))}
        <span className={`${mutedText} ml-auto flex items-center gap-2`}>
          <FiMessageCircle aria-hidden="true" />
          {post.commentCount} bình luận
        </span>
      </footer>
    </article>
  );
}
