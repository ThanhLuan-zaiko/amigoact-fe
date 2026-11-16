"use client";

import { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { setCommentLike } from "@/app/_actions/comments";
import { initials } from "@/lib/organizations";
import { sizedSrc } from "@/lib/pictureSizes";
import { absoluteTime, compactCount, relativeTime } from "@/lib/relativeTime";

// A round picture of the author, or their initials.
export function CommentAvatar({
  name,
  url,
  small = false,
}: {
  name: string;
  url?: string | null;
  small?: boolean;
}) {
  const size = small ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs";
  if (url) {
    return (
      // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
      <img
        src={sizedSrc(url, 320)}
        alt=""
        className={`${size} shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-800`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${size} flex shrink-0 items-center justify-center rounded-full border border-slate-200 font-bold text-slate-600 dark:border-slate-800 dark:text-slate-300`}
    >
      {initials(name)}
    </span>
  );
}

// The age of a comment in the viewer's own time zone. It is worked out in the
// browser after the page loads, so the server's clock and zone never leak in,
// and it moves on every minute. The tooltip has the full moment and its zone.
export function CommentTime({ iso }: { iso: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time
      dateTime={iso}
      title={now ? absoluteTime(iso) : undefined}
      className="min-w-8"
    >
      {now ? relativeTime(iso, now) : ""}
    </time>
  );
}

// The heart on the right of a comment, as on social apps. It changes at once;
// the server is told after, and a failure puts it back.
export function CommentLike({
  slug,
  postId,
  commentId,
  liked,
  count,
  canLike,
}: {
  slug: string;
  postId: string;
  commentId: string;
  liked: boolean;
  count: number;
  canLike: boolean;
}) {
  const [state, setState] = useState({ liked, count });
  const [pending, setPending] = useState(false);
  // A fresh server render (after any change on the page) wins.
  useEffect(() => setState({ liked, count }), [liked, count]);

  async function toggle() {
    const next = {
      liked: !state.liked,
      count: Math.max(0, state.count + (state.liked ? -1 : 1)),
    };
    const previous = state;
    setState(next);
    setPending(true);
    try {
      const result = await setCommentLike(slug, postId, commentId, next.liked);
      if (result.error) {
        setState(previous);
      }
    } catch {
      setState(previous);
    } finally {
      setPending(false);
    }
  }

  const label = state.liked ? "Bỏ thích" : "Thích";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!canLike || pending}
      aria-label={canLike ? label : "Đăng nhập để thích"}
      aria-pressed={state.liked}
      title={canLike ? label : "Đăng nhập để thích"}
      className={`flex w-10 shrink-0 flex-col items-center gap-0.5 rounded-md py-1 text-xs transition-colors disabled:cursor-default ${
        state.liked
          ? "text-teal-700 dark:text-teal-400"
          : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      }`}
    >
      <FiHeart
        aria-hidden="true"
        className={`text-base ${state.liked ? "fill-current" : ""}`}
      />
      {state.count > 0 ? compactCount(state.count) : null}
    </button>
  );
}
