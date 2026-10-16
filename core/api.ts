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

export function setAccessToken(token: string | null): void {
  accessToken = token;
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

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
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
    refreshPromise = (async () => {
      const body = await request<{ access_token: string }>(
        "/auth/refresh",
        { method: "POST" },
      );
      accessToken = body.access_token;
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

const NO_RETRY_PATHS = ["/auth/login", "/auth/refresh"];

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
      !NO_RETRY_PATHS.some((prefix) => path.startsWith(prefix));
    if (!needsRetry) throw error;
    try {
      await refreshAccessToken();
    } catch {
      accessToken = null;
      throw error;
    }
    return request<T>(path, init);
  }
}

async function textRequest(path: string): Promise<string> {
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
      error instanceof ApiError && error.status === 401;
    if (!needsRetry) throw error;
    try {
      await refreshAccessToken();
    } catch {
      accessToken = null;
      throw error;
    }
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
      error instanceof ApiError && error.status === 401;
    if (!needsRetry) throw error;
    try {
      await refreshAccessToken();
    } catch {
      accessToken = null;
      throw error;
    }
    return blobRequest(path);
  }
}

async function uploadRequest<T>(path: string, form: FormData, method = "POST"): Promise<T> {
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
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    try {
      await refreshAccessToken();
    } catch {
      accessToken = null;
      throw error;
    }
    return uploadRequest<T>(path, form, method);
  }
}
