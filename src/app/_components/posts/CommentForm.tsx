"use client";

import { FiSave, FiSend } from "react-icons/fi";
import type { FieldErrors, FormState } from "@/lib/account";
import { COMMENT_MAX, validateComment } from "@/lib/posts";
import { SubmitButton } from "../account/FormChrome";
import { FormMessage, TextAreaField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";

type CommentFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  // Present when editing an existing comment.
  defaultValue?: string;
  onDone?: () => void;
};

// Writes a new comment, or edits one in place. The text is checked here first,
// and the backend checks it again.
export default function CommentForm({
  action,
  defaultValue,
  onDone,
}: CommentFormProps) {
  const editing = defaultValue !== undefined;
  const { state, pending, formProps } = useAccountForm(
    async (previous, formData) => {
      const next = await action(previous, formData);
      if (next.success) {
        onDone?.();
      }
      return next;
    },
    {
      validate: (form) => {
        const body = String(new FormData(form).get("comment_body") ?? "");
        const errors: FieldErrors = {};
        const problem = validateComment(body);
        if (problem) {
          errors.comment_body = problem;
        }
        return errors;
      },
    },
  );

  return (
    <form {...formProps} className="flex flex-col gap-2">
      {editing ? null : <FormMessage state={state} />}
      <TextAreaField
        label={editing ? "Sửa bình luận" : "Viết bình luận"}
        name="comment_body"
        rows={editing ? 2 : 3}
        maxLength={COMMENT_MAX}
        defaultValue={defaultValue}
        errors={state.fieldErrors}
        required
      />
      {state.error ? (
        <p
          role="alert"
          className="text-xs font-semibold text-red-700 dark:text-red-400"
        >
          {state.error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <SubmitButton pending={pending} icon={editing ? FiSave : FiSend}>
          {pending ? "Đang gửi…" : editing ? "Lưu" : "Gửi"}
        </SubmitButton>
      </div>
    </form>
  );
}
