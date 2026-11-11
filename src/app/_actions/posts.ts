"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textValue } from "@/lib/forms";
import { parseTags, postPath, renameIssueField } from "@/lib/posts";

function postFailure(result: Extract<ApiResult<unknown>, { ok: false }>) {
  return failureState(
    result.code,
    result.issues.map((issue) => ({
      ...issue,
      field: renameIssueField(issue.field),
    })),
  );
}

function refresh(slug: string): void {
  revalidatePath("/", "layout");
  revalidatePath(postPath(slug), "layout");
}

function postFields(formData: FormData) {
  return {
    visibility: textValue(formData, "visibility") || null,
    title: textValue(formData, "post_title"),
    body: textValue(formData, "post_body"),
    tags: parseTags(textValue(formData, "post_tags")),
    media_ids: formData.getAll("media_id").map(String),
  };
}

// The organization comes from the page address, like activities/new. The backend
// checks that the user may post this kind there.
export async function createPost(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const draft = textValue(formData, "intent") === "draft";
  const result = await authedFetch<{ id: string }>(
    `/organizations/${encodeURIComponent(slug)}/posts`,
    {
      body: {
        kind: textValue(formData, "kind"),
        ...postFields(formData),
        draft,
      },
    },
  );
  if (!result.ok) {
    return postFailure(result);
  }
  refresh(slug);
  if (draft) {
    return { success: "Đã lưu bản nháp. Chỉ bạn nhìn thấy bài này." };
  }
  redirect(postPath(slug, result.data.id));
}

// Only the author edits. The kind of a post never changes. A draft can be saved
// again, or saved and published in one step.
export async function updatePost(
  slug: string,
  postId: string,
  isDraft: boolean,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch(`/posts/${encodeURIComponent(postId)}`, {
    method: "PATCH",
    body: postFields(formData),
  });
  if (!result.ok) {
    return postFailure(result);
  }
  refresh(slug);
  if (isDraft && textValue(formData, "intent") === "publish") {
    return publishDraftNow(slug, postId);
  }
  if (isDraft) {
    return { success: "Đã lưu bản nháp." };
  }
  redirect(postPath(slug, postId));
}

async function publishDraftNow(slug: string, postId: string) {
  const result = await authedFetch(
    `/posts/${encodeURIComponent(postId)}/publish`,
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug);
  redirect(postPath(slug, postId));
}

// Publishes one of the user's drafts. The backend checks that the user is the author.
export async function publishDraft(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return publishDraftNow(
    textValue(formData, "org_slug"),
    textValue(formData, "post_id"),
  );
}

// A draft is removed for good. A published post goes to the trash of its organization.
export async function deletePost(
  slug: string,
  postId: string,
  next: string,
): Promise<FormState> {
  const result = await authedFetch(`/posts/${encodeURIComponent(postId)}`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug);
  redirect(next);
}

export async function setPinned(
  slug: string,
  postId: string,
  pinned: boolean,
): Promise<FormState> {
  const verb = pinned ? "pin" : "unpin";
  const result = await authedFetch(
    `/posts/${encodeURIComponent(postId)}/${verb}`,
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug);
  return { success: pinned ? "Đã ghim bài." : "Đã bỏ ghim." };
}

export async function restorePost(
  slug: string,
  postId: string,
): Promise<FormState> {
  const result = await authedFetch(
    `/posts/${encodeURIComponent(postId)}/restore`,
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug);
  return { success: "Đã khôi phục bài viết." };
}

// The dialog already asked for the title. The backend allows it only for the owner,
// and only for a post that is in the trash.
export async function purgePost(
  slug: string,
  postId: string,
): Promise<FormState> {
  const result = await authedFetch(
    `/posts/${encodeURIComponent(postId)}/purge`,
    { method: "DELETE" },
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  refresh(slug);
  return { success: "Đã xóa vĩnh viễn bài viết." };
}
