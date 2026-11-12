import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { TokenPair } from "./lib/account";
import { ACCESS_COOKIE, REFRESH_COOKIE, tokenCookies } from "./lib/authCookies";
import { internalKeyHeaders } from "./lib/internalKey";
import { orgDecision, pagePath, parseOrgRoute } from "./lib/orgRoutes";
import { ownsOrganization } from "./lib/ownedOrganizations";
import { isProtected } from "./lib/protectedPaths";

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
    const headers = new Headers({
      "Content-Type": "application/json",
      ...internalKeyHeaders(),
    });
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

// Sends the viewer to the organization address that fits them (see
// src/lib/orgRoutes.ts). Redirects are temporary, because the answer depends on
// who is looking. `headers` carries refreshed cookies to the page.
async function routeOrganization(
  request: NextRequest,
  accessToken: string | undefined,
  headers?: Headers,
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const init = headers ? { request: { headers } } : undefined;
  const route = parseOrgRoute(pathname);
  if (!route) {
    return NextResponse.next(init);
  }
  const owner = await ownsOrganization(route.slug, accessToken);
  const decision = orgDecision(pathname, owner);
  if (decision.kind === "none") {
    return NextResponse.next(init);
  }
  const target = request.nextUrl.clone();
  target.pathname = decision.path;
  return decision.kind === "redirect"
    ? NextResponse.redirect(target, 307)
    : NextResponse.rewrite(target, init);
}

// Replaces an expired access token before the page renders, then passes the
// new cookies to this request and to the browser.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const needsLogin = isProtected(pagePath(request.nextUrl.pathname));

  if (accessToken) {
    return routeOrganization(request, accessToken);
  }
  if (!refreshToken) {
    return needsLogin
      ? redirectToLogin(request)
      : routeOrganization(request, undefined);
  }

  const refreshed = await refreshTokens(request, refreshToken);
  if (refreshed === "unavailable") {
    return needsLogin
      ? redirectToLogin(request)
      : routeOrganization(request, undefined);
  }
  if (refreshed === "rejected") {
    const response = needsLogin
      ? redirectToLogin(request)
      : await routeOrganization(request, undefined);
    response.cookies.delete(REFRESH_COOKIE);
    return response;
  }

  const cookies = tokenCookies(refreshed);
  for (const cookie of cookies) {
    request.cookies.set(cookie.name, cookie.value);
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", request.cookies.toString());
  const response = await routeOrganization(
    request,
    refreshed.access_token,
    requestHeaders,
  );
  for (const cookie of cookies) {
    response.cookies.set(cookie);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
