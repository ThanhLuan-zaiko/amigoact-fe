"use client";

import Link from "next/link";
import { useState } from "react";
import type { CommentApi } from "@/lib/posts";
import { mutedText } from "../ui";
import CommentComposer, { type ReplyTarget } from "./CommentComposer";
import CommentReplies from "./CommentReplies";
import CommentRow from "./CommentRow";

// The comments of a post, laid out like social apps: each top-level comment with
// its replies folded under it, and the box to write in at the foot. Answering a
// reply joins the same thread, the way the backend files it.
export default function CommentThread({
  slug,
  postId,
  items,
  canComment,
  signedIn,
}: {
  slug: string;
  postId: string;
  items: CommentApi[];
  canComment: boolean;
  signedIn: boolean;
}) {
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  // Each thread re-reads its replies when the viewer answers in it.
  const [versions, setVersions] = useState<Record<string, number>>({});

  function answer(rootId: string, name: string) {
    setReplyTo({ rootId, name });
  }

  function sent(rootId: string | null) {
    setReplyTo(null);
    if (rootId) {
      setVersions((current) => ({
        ...current,
        [rootId]: (current[rootId] ?? 0) + 1,
      }));
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-5 p-4">
        {items.length === 0 ? (
          <p className={`${mutedText} py-6 text-center`}>
            Chưa có bình luận nào. Hãy là người đầu tiên.
          </p>
        ) : (
          <ul className="flex flex-col gap-5">
            {items.map((comment) => {
              const reply = canComment
                ? (name: string) => answer(comment.id, name)
                : undefined;
              return (
                <li key={comment.id} className="flex flex-col gap-3">
                  <CommentRow
                    comment={comment}
                    slug={slug}
                    postId={postId}
                    signedIn={signedIn}
                    onReply={
                      reply ? () => reply(comment.author_name) : undefined
                    }
                  />
                  <CommentReplies
                    root={comment}
                    slug={slug}
                    postId={postId}
                    signedIn={signedIn}
                    onReply={reply}
                    version={versions[comment.id] ?? 0}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {canComment ? (
        <div className="sticky bottom-14 md:bottom-0">
          <CommentComposer
            slug={slug}
            postId={postId}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSent={sent}
          />
        </div>
      ) : (
        <p
          className={`${mutedText} border-t border-slate-200 p-3 text-center dark:border-slate-800`}
        >
          {signedIn ? (
            "Chỉ thành viên của tổ chức mới bình luận được."
          ) : (
            <>
              <Link
                href={`/login?next=/org/${slug}/posts/${postId}`}
                className="font-semibold text-teal-700 hover:underline dark:text-teal-400"
              >
                Đăng nhập
              </Link>{" "}
              để bình luận.
            </>
          )}
        </p>
      )}
    </div>
  );
}
