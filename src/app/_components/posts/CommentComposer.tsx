"use client";

import { useEffect, useRef } from "react";
import { FiSend, FiX } from "react-icons/fi";
import { addComment } from "@/app/_actions/comments";
import type { FieldErrors } from "@/lib/account";
import { COMMENT_MAX, validateComment } from "@/lib/posts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton } from "../ui";

export type ReplyTarget = { rootId: string; name: string };

// The box at the foot of the comments, as on social apps: one line that grows,
// and a send button. Answering someone shows who above it, with a cross to stop.
export default function CommentComposer({
  slug,
  postId,
  replyTo,
  onCancelReply,
  onSent,
}: {
  slug: string;
  postId: string;
  replyTo: ReplyTarget | null;
  onCancelReply: () => void;
  onSent: (rootId: string | null) => void;
}) {
  const box = useRef<HTMLTextAreaElement>(null);
  const { state, pending, formProps } = useAccountForm(
    async (previous, formData) => {
      const next = await addComment(slug, postId, previous, formData);
      if (next.success) {
        onSent(replyTo?.rootId ?? null);
      }
      return next;
    },
    {
      validate: (form) => {
        const body = String(new FormData(form).get("comment_body") ?? "");
        const problem = validateComment(body);
        const errors: FieldErrors = {};
        if (problem) {
          errors.comment_body = problem;
        }
        return errors;
      },
    },
  );
  const error = state.fieldErrors?.comment_body ?? state.error;

  // Choosing someone to answer puts the cursor in the box.
  useEffect(() => {
    if (replyTo) {
      box.current?.focus();
    }
  }, [replyTo]);

  return (
    <form
      {...formProps}
      className="flex flex-col gap-2 border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
    >
      {replyTo ? (
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">
            Đang trả lời{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {replyTo.name}
            </span>
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            aria-label="Thôi trả lời"
            title="Thôi trả lời"
            className="inline-flex h-7 w-7 items-center justify-center rounded-sm hover:text-slate-900 dark:hover:text-slate-100"
          >
            <FiX aria-hidden="true" />
          </button>
          <input type="hidden" name="parent_id" value={replyTo.rootId} />
        </div>
      ) : null}
      <div className="flex items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">
            {replyTo ? `Trả lời ${replyTo.name}` : "Thêm bình luận"}
          </span>
          <textarea
            ref={box}
            name="comment_body"
            rows={1}
            maxLength={COMMENT_MAX}
            placeholder={replyTo ? "Viết câu trả lời…" : "Thêm bình luận…"}
            aria-invalid={error ? true : undefined}
            className="field-sizing-content max-h-32 min-h-10 w-full resize-none rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-teal-700 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-400"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          aria-label="Gửi"
          title="Gửi"
          className={`${iconButton} text-teal-700 disabled:opacity-50 dark:text-teal-400`}
        >
          <FiSend aria-hidden="true" />
        </button>
      </div>
      {error ? (
        <p
          role="alert"
          className="text-xs font-semibold text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
