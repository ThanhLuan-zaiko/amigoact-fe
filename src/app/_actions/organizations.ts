"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch, getAccessToken } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textOrNull, textValue } from "@/lib/forms";
import { galleryIds } from "@/lib/galleryIds";
import type { OrganizationDetail } from "@/lib/organizations";
import { readPicture } from "@/lib/pictures";

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

// Text fields of the create and update forms. Empty optional fields are sent as null.
function organizationFields(formData: FormData) {
  return {
    name: textValue(formData, "name"),
    description: textOrNull(formData, "description"),
    org_type: textValue(formData, "org_type"),
    join_policy: textValue(formData, "join_policy"),
    email: textOrNull(formData, "email"),
    phone: textOrNull(formData, "phone"),
    website: textOrNull(formData, "website"),
    address: textOrNull(formData, "address"),
    city: textOrNull(formData, "city"),
    legal_name: textOrNull(formData, "legal_name"),
    tax_code: textOrNull(formData, "tax_code"),
    license_number: textOrNull(formData, "license_number"),
    legal_rep_name: textOrNull(formData, "legal_rep_name"),
    legal_rep_position: textOrNull(formData, "legal_rep_position"),
  };
}

export async function createOrganization(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  // Pictures and gallery files were uploaded in the browser and arrive as asset ids.
  const result = await authedFetch<OrganizationDetail>("/organizations", {
    body: {
      ...organizationFields(formData),
      logo_asset_id: readPicture(formData, "logo"),
      cover_asset_id: readPicture(formData, "cover"),
      gallery_asset_ids: galleryIds(formData),
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
      ...organizationFields(formData),
      logo_asset_id: readPicture(formData, "logo"),
      cover_asset_id: readPicture(formData, "cover"),
    },
  });
  const state = finish(result);
  if (!result.ok) {
    return state;
  }
  // Pictures not marked as logo or cover join the gallery. Adding is idempotent,
  // so saving the form again does not add them twice.
  for (const assetId of galleryIds(formData)) {
    const added = await authedFetch(`${organizationPath(slug)}/gallery`, {
      body: { asset_id: assetId },
    });
    if (!added.ok) {
      return failureState(added.code, added.issues);
    }
  }
  return { success: "Đã lưu thông tin tổ chức." };
}

export async function addGalleryItem(
  slug: string,
  assetId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(`${organizationPath(slug)}/gallery`, {
      body: { asset_id: assetId },
    }),
  );
}

// Sets the logo, the cover, or both in one request. A role left out stays as it is,
// so swapping them or promoting a gallery picture is a single click.
export async function chooseOrgPictures(
  slug: string,
  choice: { logo?: string | null; cover?: string | null },
): Promise<FormState> {
  const body: Record<string, string | null> = {};
  if (choice.logo !== undefined) {
    body.logo_asset_id = choice.logo;
  }
  if (choice.cover !== undefined) {
    body.cover_asset_id = choice.cover;
  }
  return finish(
    await authedFetch(`${organizationPath(slug)}/pictures`, {
      method: "PUT",
      body,
    }),
  );
}

export async function removeGalleryItem(
  slug: string,
  assetId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(
      `${organizationPath(slug)}/gallery/${encodeURIComponent(assetId)}`,
      { method: "DELETE" },
    ),
  );
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

// The owner deletes from the settings tab. The name typed there is checked in the browser,
// and the backend checks that the caller owns the organization.
export async function deleteOrganization(
  slug: string,
  _previous: FormState,
): Promise<FormState> {
  const result = await authedFetch(organizationPath(slug), {
    method: "DELETE",
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  redirect("/organizations");
}

export async function restoreOrganization(
  organizationId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(
      `/organizations/mine/deleted/${encodeURIComponent(organizationId)}/restore`,
      { method: "POST" },
    ),
  );
}

// Permanent delete. The backend refuses while certificates or pending hours still exist.
export async function purgeOrganization(
  organizationId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(
      `/organizations/mine/deleted/${encodeURIComponent(organizationId)}`,
      { method: "DELETE" },
    ),
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
