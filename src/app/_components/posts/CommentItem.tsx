"use client";

import { useState } from "react";
import { FiEdit2, FiRotateCcw, FiTrash2, FiX } from "react-icons/fi";
import {
  deleteComment,
  editComment,
  restoreComment,
} from "@/app/_actions/comments";
import type { CommentApi } from "@/lib/posts";
import ActionButton from "../organizations/ActionButton";
import { iconButton, mutedText } from "../ui";
import CommentForm from "./CommentForm";

type CommentItemProps = {
  comment: CommentApi & { when: string };
  slug: string;
  postId: string;
};

// One comment. A deleted comment keeps its place and shows no text. Only a manager
// sees the button that brings it back.
export default function CommentItem({
  comment,
  slug,
  postId,
}: CommentItemProps) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="flex flex-col gap-2 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-semibold">{comment.author_name}</span>
        <span className={mutedText}>{comment.when}</span>
        {comment.edited_at && !comment.deleted ? (
          <span className={mutedText}>· đã sửa</span>
        ) : null}
        <div className="ml-auto flex items-center gap-2">
          {comment.can_edit ? (
            <button
              type="button"
              aria-label={editing ? "Hủy sửa" : "Sửa bình luận"}
              title={editing ? "Hủy sửa" : "Sửa bình luận"}
              onClick={() => setEditing((value) => !value)}
              className={iconButton}
            >
              {editing ? (
                <FiX aria-hidden="true" />
              ) : (
                <FiEdit2 aria-hidden="true" />
              )}
            </button>
          ) : null}
          {comment.can_delete ? (
            <ActionButton
              action={deleteComment.bind(null, slug, postId, comment.id)}
              label="Xóa bình luận"
              confirmLabel="Xóa"
            >
              <FiTrash2 aria-hidden="true" />
            </ActionButton>
          ) : null}
          {comment.can_restore ? (
            <ActionButton
              action={restoreComment.bind(null, slug, postId, comment.id)}
              label="Khôi phục bình luận"
            >
              <FiRotateCcw aria-hidden="true" />
            </ActionButton>
          ) : null}
        </div>
      </div>
      {comment.deleted ? (
        <p className={`${mutedText} italic`}>Bình luận đã bị xóa.</p>
      ) : editing ? (
        <CommentForm
          action={editComment.bind(null, slug, postId, comment.id)}
          defaultValue={comment.body}
          onDone={() => setEditing(false)}
        />
      ) : (
        <p className="text-[15px] leading-relaxed break-words whitespace-pre-line text-slate-700 dark:text-slate-300">
          {comment.body}
        </p>
      )}
    </li>
  );
}
