import type { ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiImage } from "react-icons/fi";
import type { MyTagPost } from "../../activities/tags-api.ts";
import { useMyTagPosts, useMyTags, useShownTag } from "../../activities/tags-hooks.ts";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { RailCard } from "../../core/components/RailCard.tsx";
import { orgMediaUrl } from "../api.ts";

const ROW =
  "flex flex-col gap-2 px-4 py-3 hover:bg-zinc-50 focus-visible:outline-2 " +
  "focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 " +
  "dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400";

const FRAME =
  "aspect-video w-full rounded-xl border object-cover " +
  "border-zinc-200 dark:border-zinc-800";

function postHref(post: MyTagPost): string {
  const query = `org=${post.org_id}&post=${post.post_id}`;
  return post.draft
    ? `/manage/board/write?${query}`
    : `/manage/board/post?${query}`;
}

function PostPreview({ post }: { post: MyTagPost }): ReactElement {
  const title = post.title || "Bài chưa có tiêu đề";
  return (
    <li>
      <Link to={postHref(post)} className={ROW}>
        <span className="relative block">
          {post.cover_url ? (
            <img
              src={orgMediaUrl(post.cover_url)}
              alt=""
              loading="lazy"
              className={FRAME}
            />
          ) : (
            <span
              className={`${FRAME} flex items-center justify-center bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-500`}
            >
              <FiImage className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          {post.draft && (
            <span className="absolute top-2 left-2 rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs font-semibold text-zinc-700 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-200">
              Nháp
            </span>
          )}
        </span>
        <span className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </span>
      </Link>
    </li>
  );
}

// Posts that carry the tag selected in the center column.
export function TagPostRail(): ReactElement {
  const [searchParams] = useSearchParams();
  const param = searchParams.get("tag") ?? "";
  const slug = useShownTag(param);
  const tags = useMyTags();
  const tag = (tags.data ?? []).find((item) => item.slug === slug) ?? null;
  const embedded = Array.isArray(tag?.posts);
  const remote = useMyTagPosts(embedded || slug === "" ? null : slug);
  const items = embedded ? (tag?.posts ?? []) : (remote.data ?? []);
  const title = tag ? `Bài dùng #${tag.name}` : "Bài đang dùng thẻ";

  return (
    <RailCard title={title}>
      {!slug && (
        <p className="px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Chọn một thẻ để xem bài viết đang dùng thẻ đó.
        </p>
      )}
      {slug && !embedded && remote.isPending && (
        <div className="px-4 pb-4">
          <LoadingState label="Đang tải bài viết…" />
        </div>
      )}
      {slug && !embedded && remote.isError && (
        <p className="px-4 pb-4 text-sm text-red-600 dark:text-red-400">
          Không tải được bài viết của thẻ này.
        </p>
      )}
      {slug && (embedded || remote.isSuccess) && items.length === 0 && (
        <p className="px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Chưa có bài viết nào dùng thẻ này.
        </p>
      )}
      {slug && items.length > 0 && (
        <ul aria-label="Bài viết đang dùng thẻ" className="pb-2">
          {items.map((post) => (
            <PostPreview key={post.post_id} post={post} />
          ))}
        </ul>
      )}
    </RailCard>
  );
}
