import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TokenPair } from "./lib/account";
import { ACCESS_COOKIE, REFRESH_COOKIE, tokenCookies } from "./lib/authCookies";

function isProtected(pathname: string): boolean {
  return (
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/organizations/new" ||
    pathname === "/compose" ||
    pathname === "/drafts" ||
    pathname === "/activities" ||
    pathname === "/hours"
  );
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

async function refreshTokens(
  request: NextRequest,
  refreshToken: string,
): Promise<TokenPair | "rejected" | "unavailable"> {
  try {
    const headers = new Headers({ "Content-Type": "application/json" });
    const userAgent = request.headers.get("user-agent");
    if (userAgent) {
      headers.set("user-agent", userAgent);
    }
    const response = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });
    if (response.ok) {
      return (await response.json()) as TokenPair;
    }
    return response.status === 401 ? "rejected" : "unavailable";
  } catch {
    return "unavailable";
  }
}

// Replaces an expired access token before the page renders, then passes the
// new cookies to this request and to the browser.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const needsLogin = isProtected(request.nextUrl.pathname);

  if (accessToken) {
    return NextResponse.next();
  }
  if (!refreshToken) {
    return needsLogin ? redirectToLogin(request) : NextResponse.next();
  }

  const refreshed = await refreshTokens(request, refreshToken);
  if (refreshed === "unavailable") {
    return needsLogin ? redirectToLogin(request) : NextResponse.next();
  }
  if (refreshed === "rejected") {
    const response = needsLogin
      ? redirectToLogin(request)
      : NextResponse.next();
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const cookies = tokenCookies(refreshed);
  for (const cookie of cookies) {
    request.cookies.set(cookie.name, cookie.value);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", request.cookies.toString());
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of cookies) {
    response.cookies.set(cookie);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
