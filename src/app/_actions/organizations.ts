"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch, getAccessToken } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textOrNull, textValue } from "@/lib/forms";
import type { OrganizationDetail } from "@/lib/organizations";

function organizationPath(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}`;
}

function memberPath(slug: string, userId: string): string {
  return `${organizationPath(slug)}/members/${encodeURIComponent(userId)}`;
}

function applicationPath(slug: string, userId: string): string {
  return `${organizationPath(slug)}/applications/${encodeURIComponent(userId)}`;
}

// The header, the side navigation and the lists all show membership, so all of them refresh.
function finish(result: ApiResult<unknown>): FormState {
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return {};
}

export async function createOrganization(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch<OrganizationDetail>("/organizations", {
    body: {
      name: textValue(formData, "name"),
      description: textOrNull(formData, "description"),
      org_type: textValue(formData, "org_type"),
      join_policy: textValue(formData, "join_policy"),
    },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  redirect(`/organizations/${encodeURIComponent(result.data.slug)}`);
}

export async function updateOrganization(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch(organizationPath(slug), {
    method: "PATCH",
    body: {
      name: textValue(formData, "name"),
      description: textOrNull(formData, "description"),
      org_type: textValue(formData, "org_type"),
      join_policy: textValue(formData, "join_policy"),
      email: textOrNull(formData, "email"),
      phone: textOrNull(formData, "phone"),
      website: textOrNull(formData, "website"),
      address: textOrNull(formData, "address"),
      city: textOrNull(formData, "city"),
    },
  });
  const state = finish(result);
  return result.ok ? { success: "Đã lưu thông tin tổ chức." } : state;
}

export async function joinOrganization(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Visitors see the join button too, so they log in first and come back here.
  if (!(await getAccessToken())) {
    redirect(`/login?next=${encodeURIComponent(`/organizations/${slug}`)}`);
  }
  return finish(
    await authedFetch(`${organizationPath(slug)}/join`, {
      body: { message: textOrNull(formData, "message") },
    }),
  );
}

export async function leaveOrganization(slug: string): Promise<FormState> {
  return finish(
    await authedFetch(`${organizationPath(slug)}/membership`, {
      method: "DELETE",
    }),
  );
}

export async function approveApplication(
  slug: string,
  userId: string,
): Promise<FormState> {
  return finish(await authedFetch(`${applicationPath(slug, userId)}/approve`));
}

export async function rejectApplication(
  slug: string,
  userId: string,
): Promise<FormState> {
  return finish(await authedFetch(`${applicationPath(slug, userId)}/reject`));
}

export async function setMemberRole(
  slug: string,
  userId: string,
  role: "admin" | "member",
): Promise<FormState> {
  return finish(
    await authedFetch(memberPath(slug, userId), {
      method: "PATCH",
      body: { role },
    }),
  );
}

export async function removeMember(
  slug: string,
  userId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(memberPath(slug, userId), { method: "DELETE" }),
  );
}
