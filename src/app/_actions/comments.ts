"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import { failureState, textValue } from "@/lib/forms";
import { postPath, validateComment } from "@/lib/posts";

function refresh(slug: string, postId: string): void {
  revalidatePath(postPath(slug, postId));
  revalidatePath(postPath(slug));
}

function commentFailure(
  code: string,
  issues: { field: string; type: string }[],
) {
  // The comment box is named comment_body, because "body" is the post text elsewhere.
  return failureState(
    code,
    issues.map((issue) => ({
      ...issue,
      field: issue.field === "body" ? "comment_body" : issue.field,
    })),
  );
}

function readBody(formData: FormData): string | FormState {
  const body = textValue(formData, "comment_body");
  const problem = validateComment(body);
  return problem ? { fieldErrors: { comment_body: problem } } : body;
}

export async function addComment(
  slug: string,
  postId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const body = readBody(formData);
  if (typeof body !== "string") {
    return body;
  }
  const result = await authedFetch(
    `/posts/${encodeURIComponent(postId)}/comments`,
    { body: { body } },
  );
  if (!result.ok) {
    return commentFailure(result.code, result.issues);
  }
  refresh(slug, postId);
  return { success: "Đã gửi bình luận." };
}

// The backend allows an edit only for the author, within 15 minutes of writing.
export async function editComment(
  slug: string,
  postId: string,
  commentId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const body = readBody(formData);
  if (typeof body !== "string") {
    return body;
  }
  const result = await authedFetch(
    `/comments/${encodeURIComponent(commentId)}`,
    { method: "PATCH", body: { body } },
  );
  if (!result.ok) {
    return commentFailure(result.code, result.issues);
  }
  refresh(slug, postId);
  return { success: "Đã sửa bình luận." };
}

// A soft delete: the comment keeps its place in the thread and a manager can restore it.
export async function deleteComment(
  slug: string,
  postId: string,
  commentId: string,
): Promise<FormState> {
  const result = await authedFetch(
    `/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" },
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug, postId);
  return {};
}

export async function restoreComment(
  slug: string,
  postId: string,
  commentId: string,
): Promise<FormState> {
  const result = await authedFetch(
    `/comments/${encodeURIComponent(commentId)}/restore`,
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug, postId);
  return {};
}
