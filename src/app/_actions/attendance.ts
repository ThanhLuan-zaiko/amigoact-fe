"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/account";
import { numberOrNull } from "@/lib/activities";
import type { CheckInResult } from "@/lib/attendance";
import { authedFetch } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import { failureState, textOrNull, textValue } from "@/lib/forms";

function activityPath(id: string): string {
  return `/activities/${encodeURIComponent(id)}`;
}

function sessionPath(id: string): string {
  return `/attendance-sessions/${encodeURIComponent(id)}`;
}

function recordPath(id: string): string {
  return `/attendance-records/${encodeURIComponent(id)}`;
}

function finish(result: ApiResult<unknown>, success?: string): FormState {
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return success ? { success } : {};
}

export async function openSession(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(`${activityPath(id)}/attendance-sessions`, {
      body: {
        shift_id: textOrNull(formData, "shift_id"),
        minutes: numberOrNull(textValue(formData, "minutes")),
      },
    }),
  );
}

export async function closeSession(id: string): Promise<FormState> {
  return finish(await authedFetch(`${sessionPath(id)}/close`));
}

export async function markAttended(
  sessionId: string,
  registrationId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(`${sessionPath(sessionId)}/records`, {
      body: { registration_id: registrationId },
    }),
  );
}

export async function verifyRecord(id: string): Promise<FormState> {
  return finish(await authedFetch(`${recordPath(id)}/verify`));
}

export async function deleteRecord(id: string): Promise<FormState> {
  return finish(await authedFetch(recordPath(id), { method: "DELETE" }));
}

// The QR page sends a token. The form sends what the volunteer typed.
export async function checkIn(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = textOrNull(formData, "token");
  const result = await authedFetch<CheckInResult>("/attendance/check-in", {
    body: token ? { token } : { code: textValue(formData, "code") },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  revalidatePath("/", "layout");
  return {
    success:
      result.data.status === "accepted"
        ? `Đã điểm danh: ${result.data.activity_title}.`
        : `Đã gửi mã, chờ ban tổ chức xác nhận: ${result.data.activity_title}.`,
  };
}

export async function createAppeal(
  registrationId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(
      `/registrations/${encodeURIComponent(registrationId)}/appeals`,
      { body: { reason: textValue(formData, "reason") } },
    ),
  );
}

export async function approveAppeal(
  id: string,
  registrationId: string,
): Promise<FormState> {
  return finish(
    await authedFetch(`/appeals/${encodeURIComponent(id)}/approve`, {
      body: { registration_id: registrationId },
    }),
  );
}

export async function rejectAppeal(id: string): Promise<FormState> {
  return finish(await authedFetch(`/appeals/${encodeURIComponent(id)}/reject`));
}

export async function adjustHours(
  id: string,
  userId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(`${activityPath(id)}/hour-adjustments`, {
      body: {
        user_id: userId,
        delta_hours: textValue(formData, "delta_hours"),
        reason: textValue(formData, "reason"),
      },
    }),
  );
}

export async function setHourRule(
  slug: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return finish(
    await authedFetch(`/organizations/${encodeURIComponent(slug)}/hour-rule`, {
      method: "PUT",
      body: {
        multiplier: textValue(formData, "multiplier") || "1",
        cap_hours: textOrNull(formData, "cap_hours"),
      },
    }),
    "Đã lưu quy tắc tính giờ.",
  );
}
