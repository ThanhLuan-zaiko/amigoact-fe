import "server-only";
import { headers } from "next/headers";
import type { ValidationIssue } from "./forms";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: string; issues: ValidationIssue[] };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  // Multipart uploads. The browser sets the Content-Type with its boundary.
  form?: FormData;
  token?: string;
};

type ValidationItem = { loc?: unknown[]; type?: unknown };

function parseFailure(status: number, payload: unknown): ApiResult<never> {
  const detail = (payload as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") {
    return { ok: false, status, code: detail, issues: [] };
  }
  if (Array.isArray(detail)) {
    const issues = (detail as ValidationItem[]).map((item) => ({
      field: String(item.loc?.at(-1) ?? ""),
      type: String(item.type ?? ""),
    }));
    return { ok: false, status, code: "validation_error", issues };
  }
  return { ok: false, status, code: "unknown_error", issues: [] };
}

// Calls the backend from the server. The browser never talks to it directly.
export async function backendFetch<T>(
  path: string,
  { method = "POST", body, form, token }: RequestOptions = {},
): Promise<ApiResult<T>> {
  const incoming = await headers();
  const outgoing = new Headers();
  if (!form) {
    outgoing.set("Content-Type", "application/json");
  }
  for (const name of ["user-agent", "x-forwarded-for"]) {
    const value = incoming.get(name);
    if (value) {
      outgoing.set(name, value);
    }
  }
  if (token) {
    outgoing.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.BACKEND_URL}${path}`, {
      method,
      headers: outgoing,
      body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, code: "network_error", issues: [] };
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    return parseFailure(response.status, payload);
  }
  return { ok: true, data: payload as T };
}
