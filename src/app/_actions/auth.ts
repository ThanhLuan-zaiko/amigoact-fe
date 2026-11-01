"use server";

import { redirect } from "next/navigation";
import type { AuthResponse, FormState } from "@/lib/account";
import { saveTokens } from "@/lib/auth";
import { backendFetch } from "@/lib/backend";
import {
  failureState,
  passwordValue,
  safeNextPath,
  textOrNull,
  textValue,
} from "@/lib/forms";
import { FIELD_MESSAGES } from "@/lib/validation";

export async function login(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await backendFetch<AuthResponse>("/auth/login", {
    body: {
      email: textValue(formData, "email"),
      password: passwordValue(formData, "password"),
    },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  await saveTokens(result.data.tokens);
  redirect(safeNextPath(formData.get("next")));
}

export async function register(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = passwordValue(formData, "password");
  if (password !== passwordValue(formData, "confirm_password")) {
    return { fieldErrors: { confirm_password: FIELD_MESSAGES.mismatch } };
  }
  const accountType = textValue(formData, "account_type");
  const isBusiness = accountType === "business";
  const result = await backendFetch<AuthResponse>("/auth/register", {
    body: {
      email: textValue(formData, "email"),
      password,
      full_name: textValue(formData, "full_name"),
      phone: textOrNull(formData, "phone"),
      account_type: isBusiness ? "business" : "individual",
      company_name: isBusiness ? textOrNull(formData, "company_name") : null,
      tax_code: isBusiness ? textOrNull(formData, "tax_code") : null,
    },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  await saveTokens(result.data.tokens);
  redirect("/account");
}

export async function forgotPassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await backendFetch("/auth/password/forgot", {
    body: { email: textValue(formData, "email") },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  return {
    success:
      "Nếu email này đã đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu trong ít phút.",
  };
}

export async function resetPassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const newPassword = passwordValue(formData, "new_password");
  if (newPassword !== passwordValue(formData, "confirm_password")) {
    return { fieldErrors: { confirm_password: FIELD_MESSAGES.mismatch } };
  }
  const result = await backendFetch("/auth/password/reset", {
    body: {
      token: textValue(formData, "token"),
      new_password: newPassword,
    },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  return { success: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập ngay." };
}

export async function verifyEmail(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await backendFetch("/auth/email/verify", {
    body: { token: textValue(formData, "token") },
  });
  if (!result.ok) {
    return failureState(result.code, result.issues);
  }
  return { success: "Email của bạn đã được xác minh." };
}
