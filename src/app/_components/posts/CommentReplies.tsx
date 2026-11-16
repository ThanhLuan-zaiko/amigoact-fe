"use client";

import { useEffect, useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { loadReplies } from "@/app/_actions/comments";
import type { CommentApi } from "@/lib/posts";
import { mutedText } from "../ui";
import CommentRow from "./CommentRow";

const toggleButton =
  "inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100";

// The replies under a top-level comment, shut until someone opens them, as on
// social apps. A new reply in this thread opens it and reads it again.
export default function CommentReplies({
  root,
  slug,
  postId,
  signedIn,
  onReply,
  version,
}: {
  root: CommentApi;
  slug: string;
  postId: string;
  signedIn: boolean;
  onReply?: (name: string) => void;
  // Goes up when the viewer replies in this thread.
  version: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CommentApi[] | null>(null);
  const [failed, setFailed] = useState(false);
  const count = root.reply_count ?? 0;

  async function read() {
    setFailed(false);
    try {
      const replies = await loadReplies(root.id);
      setItems(replies ?? []);
      setFailed(replies === null);
    } catch {
      setFailed(true);
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: only a new reply here re-reads the thread.
  useEffect(() => {
    if (version > 0) {
      setOpen(true);
      read();
    }
  }, [version]);

  if (count === 0 && !open) {
    return null;
  }
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          read();
        }}
        className={`${toggleButton} ml-12`}
      >
        Xem {count} câu trả lời
        <FiChevronDown aria-hidden="true" />
      </button>
    );
  }
  return (
    <div className="ml-12 flex flex-col gap-3">
      {items === null ? (
        <p className={mutedText}>Đang tải…</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((reply) => (
            <li key={reply.id}>
              <CommentRow
                comment={reply}
                slug={slug}
                postId={postId}
                signedIn={signedIn}
                onReply={onReply ? () => onReply(reply.author_name) : undefined}
                small
              />
            </li>
          ))}
        </ul>
      )}
      {failed ? <p className={mutedText}>Không tải được câu trả lời.</p> : null}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={toggleButton}
      >
        Ẩn
        <FiChevronUp aria-hidden="true" />
      </button>
    </div>
  );
}
