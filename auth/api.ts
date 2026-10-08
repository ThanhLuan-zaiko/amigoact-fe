import { ApiError, apiFetch, setAccessToken } from "../core/api.ts";

export interface SessionProfile {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  email_verified: boolean;
  created_at: string;
}

export interface RegisterInput {
  email: string;
  phone: string;
  password: string;
  full_name: string;
}

interface TokenBody {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export async function registerAccount(input: RegisterInput): Promise<SessionProfile> {
  return apiFetch<SessionProfile>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmailAccount(input: {
  email: string;
  code: string;
}): Promise<SessionProfile> {
  return apiFetch<SessionProfile>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resendVerificationCode(email: string): Promise<void> {
  await apiFetch<unknown>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function loginAccount(input: {
  email: string;
  password: string;
}): Promise<TokenBody> {
  const body = await apiFetch<TokenBody>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(body.access_token);
  return body;
}

export async function fetchSession(): Promise<SessionProfile | null> {
  try {
    return await apiFetch<SessionProfile>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

export async function logoutAccount(): Promise<void> {
  try {
    await apiFetch<unknown>("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function logoutAllSessions(): Promise<void> {
  try {
    await apiFetch<unknown>("/auth/logout-all", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function forgotPasswordAccount(email: string): Promise<void> {
  await apiFetch<unknown>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordAccount(input: {
  email: string;
  code: string;
  new_password: string;
}): Promise<void> {
  await apiFetch<unknown>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  setAccessToken(null);
}

export async function changePasswordAccount(input: {
  current_password: string;
  new_password: string;
}): Promise<void> {
  await apiFetch<unknown>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function clearSessionToken(): void {
  setAccessToken(null);
}
