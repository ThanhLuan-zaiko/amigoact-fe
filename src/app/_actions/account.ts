"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/lib/account";
import { authedFetch, clearTokens, getCurrentUser } from "@/lib/auth";
import type { ApiResult } from "@/lib/backend";
import {
  failureState,
  passwordValue,
  textOrNull,
  textValue,
} from "@/lib/forms";
import { FIELD_MESSAGES } from "@/lib/validation";

function failure(result: ApiResult<unknown>): FormState {
  return result.ok ? {} : failureState(result.code, result.issues);
}

export async function updateProfile(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  const business =
    user?.account_type === "business"
      ? {
          company_name: textOrNull(formData, "company_name"),
          tax_code: textOrNull(formData, "tax_code"),
          legal_rep_name: textOrNull(formData, "legal_rep_name"),
          legal_rep_id: textOrNull(formData, "legal_rep_id"),
          legal_rep_position: textOrNull(formData, "legal_rep_position"),
        }
      : {};
  const result = await authedFetch("/account/me", {
    method: "PATCH",
    body: {
      full_name: textValue(formData, "full_name"),
      phone: textOrNull(formData, "phone"),
      date_of_birth: textOrNull(formData, "date_of_birth"),
      gender: textOrNull(formData, "gender"),
      address: textOrNull(formData, "address"),
      ...business,
    },
  });
  if (!result.ok) {
    return failure(result);
  }
  revalidatePath("/account", "layout");
  return { success: "Đã lưu thông tin tài khoản." };
}

export async function changePassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const newPassword = passwordValue(formData, "new_password");
  if (newPassword !== passwordValue(formData, "confirm_password")) {
    return { fieldErrors: { confirm_password: FIELD_MESSAGES.mismatch } };
  }
  const result = await authedFetch("/auth/password/change", {
    body: {
      current_password: passwordValue(formData, "current_password"),
      new_password: newPassword,
    },
  });
  if (!result.ok) {
    return failure(result);
  }
  revalidatePath("/account/security");
  return {
    success: "Đã đổi mật khẩu. Các thiết bị khác đã được đăng xuất.",
  };
}

export async function resendVerification(
  _previous: FormState,
  _formData: FormData,
): Promise<FormState> {
  const result = await authedFetch("/auth/email/resend");
  if (!result.ok) {
    return failure(result);
  }
  return { success: "Đã gửi lại liên kết xác minh tới email của bạn." };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await authedFetch(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
  revalidatePath("/account/security");
}

export async function logout(): Promise<void> {
  await authedFetch("/auth/logout");
  await clearTokens();
  redirect("/");
}

export async function logoutAll(): Promise<void> {
  await authedFetch("/auth/logout-all");
  await clearTokens();
  redirect("/login");
}
