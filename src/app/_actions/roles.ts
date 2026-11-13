"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/account";
import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textValue } from "@/lib/forms";

// The form inputs have their own names, so a backend error lands on the right input.
const FORM_FIELDS: Record<string, string> = {
  name: "role_name",
  color: "role_color",
  permissions: "role_permissions",
};

function rolesPath(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}/roles`;
}

// Members, roles and the viewer's own menu all depend on roles, so everything refreshes.
function finish(result: ApiResult<unknown>): FormState {
  if (!result.ok) {
    return failureState(
      result.code,
      result.issues.map((issue) => ({
        ...issue,
        field: FORM_FIELDS[issue.field] ?? issue.field,
      })),
    );
  }
  revalidatePath("/", "layout");
  return { success: "Đã lưu." };
}

function roleFields(formData: FormData) {
  return {
    name: textValue(formData, "role_name"),
    color: textValue(formData, "role_color"),
    permissions: formData
      .getAll("role_permissions")
      .filter((value): value is string => typeof value === "string"),
  };
}

export async function createRole(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(rolesPath(slug), {
      method: "POST",
      body: roleFields(formData),
    }),
  );
}

export async function updateRole(
  slug: string,
  roleId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(`${rolesPath(slug)}/${encodeURIComponent(roleId)}`, {
      method: "PATCH",
      body: roleFields(formData),
    }),
  );
}

export async function deleteRole(
  slug: string,
  roleId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(`${rolesPath(slug)}/${encodeURIComponent(roleId)}`, {
      method: "DELETE",
    }),
  );
}

// The ids go from the highest role to the lowest, for the roles the viewer may move.
export async function reorderRoles(
  slug: string,
  roleIds: string[],
): Promise<FormState> {
  return finish(
    await authedFetch(`${rolesPath(slug)}/order`, {
      method: "PUT",
      body: { role_ids: roleIds },
    }),
  );
}

export async function setMemberRoles(
  slug: string,
  userId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const roleIds = formData
    .getAll("member_roles")
    .filter((value): value is string => typeof value === "string");
  return finish(
    await authedFetch(
      `/organizations/${encodeURIComponent(slug)}/members/${encodeURIComponent(userId)}/roles`,
      { method: "PUT", body: { role_ids: roleIds } },
    ),
  );
}
