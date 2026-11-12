import Link from "next/link";
import { FiEye, FiImage } from "react-icons/fi";
import { bodyExcerpt } from "@/lib/postFormat";
import PostMediaView from "./PostMediaView";
import type { PostMedia } from "./types";

// The short form of a post in a list: a few lines of text, one picture,
// and a link to the full post. The post page shows everything.
export default function PostPreview({
  body,
  media,
  href,
}: {
  body: string;
  media: PostMedia[];
  href: string;
}) {
  const excerpt = bodyExcerpt(body);
  const [cover, ...rest] = media;
  return (
    <div className="flex flex-col gap-3">
      {excerpt ? (
        <p className="line-clamp-3 text-[15px] leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300">
          {excerpt}
        </p>
      ) : null}
      {cover ? (
        <Link href={href} className="relative block" tabIndex={-1}>
          <PostMediaView item={cover} tile />
          {rest.length > 0 ? (
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-slate-900/70 px-2 py-1 text-xs font-semibold text-white">
              <FiImage aria-hidden="true" />+{rest.length}
            </span>
          ) : null}
        </Link>
      ) : null}
      <Link
        href={href}
        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
      >
        <FiEye aria-hidden="true" />
        Xem thêm
      </Link>
    </div>
  );
}
