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

function toApiError(status: number, body: unknown): ApiError {
  const envelope = body as Partial<ApiErrorEnvelope>;
  const code =
    typeof envelope?.code === "string" ? envelope.code : "REQUEST_FAILED";
  const message =
    typeof envelope?.message === "string"
      ? envelope.message
      : `Request failed (${status})`;
  return new ApiError(status, { code, message });
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers ?? {}) as Record<string, string>),
  };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
  if (response.status === 204) return undefined as T;
  const body = (await response.json()) as unknown;
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
      accessToken !== null &&
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
