"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import { failureState, textValue } from "@/lib/forms";
import { parseTags, renameIssueField } from "@/lib/posts";

export async function createPost(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const slug = textValue(formData, "org_slug");
  if (!slug) {
    return failureState("validation_error", [
      { field: "org_slug", type: "org_required" },
    ]);
  }
  const draft = textValue(formData, "intent") === "draft";
  const result = await authedFetch(
    `/organizations/${encodeURIComponent(slug)}/posts`,
    {
      body: {
        kind: textValue(formData, "kind"),
        visibility: textValue(formData, "visibility") || null,
        title: textValue(formData, "post_title"),
        body: textValue(formData, "post_body"),
        tags: parseTags(textValue(formData, "post_tags")),
        media_ids: formData.getAll("media_id").map(String),
        draft,
      },
    },
  );
  if (!result.ok) {
    return failureState(
      result.code,
      result.issues.map((issue) => ({
        ...issue,
        field: renameIssueField(issue.field),
      })),
    );
  }
  revalidatePath("/", "layout");
  if (draft) {
    return { success: "Đã lưu bản nháp. Chỉ bạn nhìn thấy bài này." };
  }
  redirect("/");
}

// Publishes one of the user's drafts. The backend checks that the user is the author.
export async function publishDraft(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = textValue(formData, "post_id");
  const result = await authedFetch(`/posts/${encodeURIComponent(id)}/publish`);
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  redirect("/");
}
