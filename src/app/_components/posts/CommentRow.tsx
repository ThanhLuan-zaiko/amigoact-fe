"use client";

import { useState } from "react";
import {
  deleteComment,
  editComment,
  restoreComment,
} from "@/app/_actions/comments";
import type { CommentApi } from "@/lib/posts";
import ActionButton from "../organizations/ActionButton";
import { mutedText } from "../ui";
import { CommentAvatar, CommentLike, CommentTime } from "./CommentBits";
import CommentForm from "./CommentForm";

const metaButton =
  "text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100";

type CommentRowProps = {
  comment: CommentApi;
  slug: string;
  postId: string;
  signedIn: boolean;
  // Present when the viewer may answer; replies answer into the same thread.
  onReply?: () => void;
  small?: boolean;
};

// One comment laid out like social apps: avatar, name, text, then the age and
// the small actions, with the heart on the right. A deleted comment keeps its
// place and shows no text; only a manager sees the button that brings it back.
export default function CommentRow({
  comment,
  slug,
  postId,
  signedIn,
  onReply,
  small = false,
}: CommentRowProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex gap-3">
      <CommentAvatar
        name={comment.author_name}
        url={comment.author_avatar_url}
        small={small}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-sm font-semibold text-slate-500 dark:text-slate-400">
          {comment.author_name}
        </span>
        {comment.deleted ? (
          <p className={`${mutedText} italic`}>Bình luận đã bị xóa.</p>
        ) : editing ? (
          <CommentForm
            action={editComment.bind(null, slug, postId, comment.id)}
            defaultValue={comment.body}
            onDone={() => setEditing(false)}
          />
        ) : (
          <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-slate-900 dark:text-slate-100">
            {comment.body}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
          <CommentTime iso={comment.created_at} />
          {comment.edited_at && !comment.deleted ? <span>Đã sửa</span> : null}
          {onReply && !comment.deleted ? (
            <button type="button" onClick={onReply} className={metaButton}>
              Trả lời
            </button>
          ) : null}
          {comment.can_edit ? (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className={metaButton}
            >
              {editing ? "Hủy sửa" : "Sửa"}
            </button>
          ) : null}
          {comment.can_delete ? (
            <ActionButton
              action={deleteComment.bind(null, slug, postId, comment.id)}
              label="Xóa bình luận"
              confirmLabel="Xóa"
              className={metaButton}
            >
              Xóa
            </ActionButton>
          ) : null}
          {comment.can_restore ? (
            <ActionButton
              action={restoreComment.bind(null, slug, postId, comment.id)}
              label="Khôi phục bình luận"
              className={metaButton}
            >
              Khôi phục
            </ActionButton>
          ) : null}
        </div>
      </div>
      {comment.deleted ? null : (
        <CommentLike
          slug={slug}
          postId={postId}
          commentId={comment.id}
          liked={comment.liked ?? false}
          count={comment.like_count ?? 0}
          canLike={signedIn}
        />
      )}
    </div>
  );
}
