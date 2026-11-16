import Link from "next/link";
import { FiChevronRight, FiMessageCircle } from "react-icons/fi";
import { focusClass } from "@/lib/focus";
import { sizedSrc } from "@/lib/pictureSizes";
import { getOrgPosts } from "@/lib/postApi";
import { postPath } from "@/lib/posts";
import IconStat from "../IconStat";
import { mutedText } from "../ui";

const OTHER_COUNT = 5;

// The "Bài viết khác" tab beside a post: the organization's newest posts other
// than this one, each with its first picture. Read behind a Suspense boundary.
export default async function OrgOtherPosts({
  slug,
  postId,
}: {
  slug: string;
  postId: string;
}) {
  const page = await getOrgPosts(slug, "all", null, OTHER_COUNT + 1);
  if (page === null) {
    return (
      <p className={`${mutedText} p-4`}>
        Không tải được bài viết. Thử lại sau.
      </p>
    );
  }
  const posts = page.posts
    .filter((post) => post.id !== postId)
    .slice(0, OTHER_COUNT);
  return (
    <div className="flex flex-col">
      {posts.length === 0 ? (
        <p className={`${mutedText} p-4`}>Tổ chức chưa có bài viết nào khác.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800">
          {posts.map((post) => {
            const picture = post.media?.find((item) => !item.isVideo);
            return (
              <li key={post.id}>
                <Link
                  href={postPath(slug, post.id)}
                  className="flex gap-3 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  {picture ? (
                    // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
                    <img
                      src={sizedSrc(picture.src, 320)}
                      alt=""
                      loading="lazy"
                      className={`h-16 w-16 shrink-0 rounded-md object-cover ${focusClass(picture.focus)}`}
                    />
                  ) : null}
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="line-clamp-2 font-semibold break-words">
                      {post.title}
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      <span className={mutedText}>{post.publishedAt}</span>
                      <IconStat icon={FiMessageCircle} label="Bình luận">
                        {post.commentCount}
                      </IconStat>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href={postPath(slug)}
        className="inline-flex items-center justify-center gap-1 border-t border-slate-200 p-3 text-sm font-semibold text-teal-700 hover:underline dark:border-slate-800 dark:text-teal-400"
      >
        Xem tất cả bài viết
        <FiChevronRight aria-hidden="true" />
      </Link>
    </div>
  );
}
