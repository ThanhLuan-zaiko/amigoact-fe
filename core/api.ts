export interface ApiErrorEnvelope {
  code: string;
  message: string;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, envelope: ApiErrorEnvelope) {
    super(envelope.message);
    this.name = "ApiError";
    this.code = envelope.code;
    this.status = status;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<string> | null = null;
// Token in place when the in-flight refresh was sent: its failure may only clear that token.
let refreshBaseline: string | null = null;
// True once the boot probe (or a failed refresh retry) proved there is no
// usable refresh cookie: protected calls then fail fast instead of paying
// a doomed refresh round-trip per request.
let guestOnly = false;
let probePromise: Promise<void> | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function setAccessToken(
  token: string | null,
  expiresIn?: number,
): void {
  accessToken = token;
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  if (token !== null) {
    guestOnly = false;
    if (expiresIn !== undefined) scheduleTokenRefresh(expiresIn);
  }
}

// Renew near 80% of the token lifetime so requests never meet a stale
// token; failures defer to the reactive 401-retry path on next request.
function scheduleTokenRefresh(expiresIn: number): void {
  refreshTimer = setTimeout(() => {
    refreshTimer = null;
    refreshAccessToken().catch(() => undefined);
  }, Math.max(1_000, expiresIn * 800));
}

/**
 * One-shot session probe. The refresh cookie is HttpOnly, so a fresh page
 * load cannot tell guest from signed-in without asking /auth/refresh once.
 * Every early request shares this promise; once it settles, calls either
 * carry the minted token or run anonymously (guestOnly). The backend
 * returns 401 before touching the rate limiter when no cookie is sent.
 */
export function probeSession(): Promise<void> {
  if (!probePromise) {
    probePromise = refreshAccessToken()
      .then(() => undefined)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          guestOnly = true;
        }
      });
  }
  return probePromise;
}

/** True once the probe proved there is no usable refresh cookie. */
export function isGuestSession(): boolean {
  return guestOnly && accessToken === null;
}

function resolveBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, "");
  return "http://localhost:8100";
}

export function apiBaseUrl(): string {
  return resolveBaseUrl();
}

function toApiError(status: number, body: unknown): ApiError {
  const envelope = body as Partial<ApiErrorEnvelope> | null | undefined;
  const code =
    typeof envelope?.code === "string" ? envelope.code : "REQUEST_FAILED";
  const message =
    typeof envelope?.message === "string"
      ? envelope.message
      : `Request failed (${status})`;
  return new ApiError(status, { code, message });
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

// Auth endpoints skip both the boot probe and the 401 refresh retry.
const NO_RETRY_PATHS = ["/auth/login", "/auth/refresh"];

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Without a token, wait on the boot probe first: signed-in reloads then
  // send Bearer credentials on the very first attempt instead of eating a
  // 401 per query. Auth endpoints never trigger the probe themselves.
  if (!accessToken && !NO_RETRY_PATHS.some((p) => path.startsWith(p))) {
    await probeSession();
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers ?? {}) as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    // API JSON must never sit in the HTTP cache; query state is the cache.
    cache: "no-store",
    credentials: "include",
    headers,
  });
  if (response.status === 204) return undefined as T;
  const body = await readBody(response);
  if (!response.ok) throw toApiError(response.status, body);
  return body as T;
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshBaseline = accessToken;
    refreshPromise = (async () => {
      const body = await request<{
        access_token: string;
        expires_in: number;
      }>("/auth/refresh", { method: "POST" });
      setAccessToken(body.access_token, body.expires_in);
      return body.access_token;
    })();
    try {
      return await refreshPromise;
    } finally {
      refreshPromise = null;
    }
  }
  return refreshPromise;
}

// Shared refresh-or-fail step for every public wrapper: a dead refresh
// cookie (401) marks the page guest so later calls stop retrying.
async function refreshForRetry(original: ApiError): Promise<void> {
  // Read right after the call: refreshBaseline then belongs to this refresh.
  const pending = refreshAccessToken();
  const baseline = refreshBaseline;
  try {
    await pending;
  } catch (refreshError) {
    // A sign-in that landed during the refresh owns the token, so keep it.
    if (accessToken === baseline) {
      setAccessToken(null);
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        guestOnly = true;
      }
    }
    throw original;
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  try {
    return await request<T>(path, init);
  } catch (error) {
    const needsRetry =
      error instanceof ApiError &&
      error.status === 401 &&
      !guestOnly &&
      !NO_RETRY_PATHS.some((prefix) => path.startsWith(prefix));
    if (!needsRetry) throw error;
    await refreshForRetry(error);
    return request<T>(path, init);
  }
}

async function textRequest(path: string): Promise<string> {
  if (!accessToken) await probeSession();
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    cache: "no-store",
    credentials: "include",
    headers,
  });
  if (!response.ok) throw toApiError(response.status, await readBody(response));
  return response.text();
}

export async function apiTextFetch(path: string): Promise<string> {
  try {
    return await textRequest(path);
  } catch (error) {
    const needsRetry =
      error instanceof ApiError && error.status === 401 && !guestOnly;
    if (!needsRetry) throw error;
    await refreshForRetry(error);
    return textRequest(path);
  }
}

export interface BlobResult {
  blob: Blob;
  filename: string | null;
}

function dispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(header);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1].replace(/"$/, ""));
  } catch {
    return match[1].replace(/"$/, "");
  }
}

async function blobRequest(path: string): Promise<BlobResult> {
  if (!accessToken) await probeSession();
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    cache: "no-store",
    credentials: "include",
    headers,
  });
  if (!response.ok) throw toApiError(response.status, await readBody(response));
  return {
    blob: await response.blob(),
    filename: dispositionFilename(
      response.headers.get("Content-Disposition"),
    ),
  };
}

export async function apiBlobFetch(path: string): Promise<BlobResult> {
  try {
    return await blobRequest(path);
  } catch (error) {
    const needsRetry =
      error instanceof ApiError && error.status === 401 && !guestOnly;
    if (!needsRetry) throw error;
    await refreshForRetry(error);
    return blobRequest(path);
  }
}

async function uploadRequest<T>(path: string, form: FormData, method = "POST"): Promise<T> {
  if (!accessToken) await probeSession();
  const headers: Record<string, string> = {};
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    method,
    cache: "no-store",
    credentials: "include",
    headers,
    body: form,
  });
  if (response.status === 204) return undefined as T;
  const body = await readBody(response);
  if (!response.ok) throw toApiError(response.status, body);
  return body as T;
}

export async function apiUpload<T>(path: string, form: FormData, method = "POST"): Promise<T> {
  try {
    return await uploadRequest<T>(path, form, method);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || guestOnly) {
      throw error;
    }
    await refreshForRetry(error);
    return uploadRequest<T>(path, form, method);
  }
}
