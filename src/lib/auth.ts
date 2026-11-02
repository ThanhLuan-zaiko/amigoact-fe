import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionInfo, TokenPair, User } from "./account";
import { ACCESS_COOKIE, REFRESH_COOKIE, tokenCookies } from "./authCookies";
import { type ApiResult, backendFetch } from "./backend";

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

// Cookies can only be written from Server Functions and Route Handlers.
export async function saveTokens(tokens: TokenPair): Promise<void> {
  const store = await cookies();
  for (const cookie of tokenCookies(tokens)) {
    store.set(cookie);
  }
}

export async function clearTokens(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

// Read it behind a Suspense boundary. React memoizes this identical GET across
// the components of one render, so several callers make one request.
export async function getCurrentUser(): Promise<User | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const result = await backendFetch<User>("/account/me", {
    method: "GET",
    token,
  });
  return result.ok ? result.data : null;
}

export async function requireUser(next: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return user;
}

type AuthedOptions = {
  method?: "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

// For Server Actions. Every action authorizes itself: the backend checks the token on each call.
export async function authedFetch<T = unknown>(
  path: string,
  options: AuthedOptions = {},
): Promise<ApiResult<T>> {
  const result = await backendFetch<T>(path, {
    ...options,
    token: await getAccessToken(),
  });
  if (!result.ok && result.status === 401) {
    await clearTokens();
    redirect("/login");
  }
  return result;
}

export async function getSessions(): Promise<SessionInfo[]> {
  const token = await getAccessToken();
  const result = await backendFetch<SessionInfo[]>("/auth/sessions", {
    method: "GET",
    token,
  });
  return result.ok ? result.data : [];
}
