"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import {
  type ActivityDetail,
  fromLocalInput,
  numberOrNull,
} from "@/lib/activities";
import { authedFetch, getAccessToken } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textOrNull, textValue } from "@/lib/forms";
import { parseTags } from "@/lib/posts";

function activityPath(id: string): string {
  return `/activities/${encodeURIComponent(id)}`;
}

function registrationPath(id: string): string {
  return `/registrations/${encodeURIComponent(id)}`;
}

function finish(result: ApiResult<unknown>): FormState {
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return {};
}

function activityBody(formData: FormData) {
  return {
    title: textValue(formData, "title"),
    description: textOrNull(formData, "description"),
    location: textOrNull(formData, "location"),
    address: textOrNull(formData, "address"),
    city: textOrNull(formData, "city"),
    is_remote: formData.get("is_remote") === "on",
    start_at: fromLocalInput(textValue(formData, "start_at")),
    end_at: fromLocalInput(textValue(formData, "end_at")),
    registration_deadline: fromLocalInput(
      textValue(formData, "registration_deadline"),
    ),
    max_participants: numberOrNull(textValue(formData, "max_participants")),
    hours_awarded: textOrNull(formData, "hours_awarded"),
    requires_approval: formData.get("requires_approval") === "on",
    tags: parseTags(textValue(formData, "tags")),
  };
}

export async function createActivity(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const body = activityBody(formData);
  const publishNow = formData.get("intent") === "publish";
  // Checked before creating, so a refused publish does not leave a stray draft behind.
  if (publishNow && body.start_at && new Date(body.start_at) <= new Date()) {
    return failureState("validation_error", [
      { field: "start_at", type: "start_in_past" },
    ]);
  }
  const result = await authedFetch<ActivityDetail>(
    `/organizations/${encodeURIComponent(slug)}/activities`,
    { body },
  );
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  if (publishNow) {
    // If this fails, the activity stays a draft and its page offers the publish button.
    await authedFetch(`${activityPath(result.data.id)}/publish`);
  }
  revalidatePath("/", "layout");
  redirect(activityPath(result.data.id));
}

export async function updateActivity(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch(activityPath(id), {
    method: "PATCH",
    body: activityBody(formData),
  });
  const state = finish(result);
  return result.ok ? { success: "Đã lưu." } : state;
}

export async function publishActivity(id: string): Promise<FormState> {
  const result = await authedFetch(`${activityPath(id)}/publish`);
  if (!result.ok && result.issues.some((issue) => issue.type === "required")) {
    return { error: "Hãy nhập đủ thời gian và địa điểm trước khi đăng." };
  }
  return finish(result);
}

export async function completeActivity(id: string): Promise<FormState> {
  return finish(await authedFetch(`${activityPath(id)}/complete`));
}

export async function cancelActivity(id: string): Promise<FormState> {
  return finish(await authedFetch(`${activityPath(id)}/cancel`));
}

export async function deleteActivity(
  id: string,
  slug: string,
): Promise<FormState> {
  const result = await authedFetch(activityPath(id), { method: "DELETE" });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  // Only drafts can be deleted, so the drafts list is where the manager was working.
  redirect(`/org/${encodeURIComponent(slug)}/activities/drafts`);
}

// A deleted draft comes back as a draft. Owners and admins may do it.
export async function restoreActivity(
  slug: string,
  id: string,
): Promise<FormState> {
  const result = await authedFetch(`${activityPath(id)}/restore`);
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath(`/org/${encodeURIComponent(slug)}/activities`, "layout");
  return { success: "Đã khôi phục hoạt động về bản nháp." };
}

// The dialog already asked for the title. The backend allows it only for the owner.
export async function purgeActivity(
  slug: string,
  id: string,
): Promise<FormState> {
  const result = await authedFetch(`${activityPath(id)}/purge`, {
    method: "DELETE",
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath(`/org/${encodeURIComponent(slug)}/activities`, "layout");
  return { success: "Đã xóa vĩnh viễn hoạt động." };
}

function shiftBody(formData: FormData) {
  return {
    title: textValue(formData, "shift_title"),
    start_at: fromLocalInput(textValue(formData, "start_at")),
    end_at: fromLocalInput(textValue(formData, "end_at")),
    capacity: numberOrNull(textValue(formData, "capacity")),
  };
}

export async function createShift(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch(`${activityPath(id)}/shifts`, {
    body: shiftBody(formData),
  });
  const state = finish(result);
  return result.ok ? { success: "Đã thêm ca." } : state;
}

export async function updateShift(
  id: string,
  shiftId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await authedFetch<unknown>(
    `${activityPath(id)}/shifts/${encodeURIComponent(shiftId)}`,
    { method: "PUT", body: shiftBody(formData) },
  );
  const state = finish(result);
  return result.ok ? { success: "Đã lưu ca." } : state;
}

export async function deleteShift(
  id: string,
  shiftId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(
      `${activityPath(id)}/shifts/${encodeURIComponent(shiftId)}`,
      { method: "DELETE" },
    ),
  );
}

export async function registerForActivity(
  id: string,
  shiftId: string | null,
): Promise<FormState> {
  // Visitors see the button too, so they log in first and come back here.
  if (!(await getAccessToken())) {
    redirect(`/login?next=${encodeURIComponent(activityPath(id))}`);
  }
  return finish(
    await authedFetch(`${activityPath(id)}/registrations`, {
      body: { shift_id: shiftId },
    }),
  );
}

export async function cancelRegistration(id: string): Promise<FormState> {
  return finish(await authedFetch(registrationPath(id), { method: "DELETE" }));
}

export async function approveRegistration(id: string): Promise<FormState> {
  return finish(
    await authedFetch(`${registrationPath(id)}/approve`, { body: {} }),
  );
}

export async function rejectRegistration(id: string): Promise<FormState> {
  return finish(
    await authedFetch(`${registrationPath(id)}/reject`, { body: {} }),
  );
}
