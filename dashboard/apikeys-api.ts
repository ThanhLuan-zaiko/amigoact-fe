import { apiFetch } from "../core/api.ts";

export interface ApiKeyItem {
  key_id: string;
  name: string;
  scopes: string[];
  expires_at: string | null;
  revoked_at: string | null;
  last_used_at: string | null;
  created_at: string | null;
}

export interface IssuedApiKey {
  key_id: string;
  name: string;
  api_key: string;
  scopes: string[];
  expires_at: string | null;
}

export function listApiKeys(orgId: string): Promise<ApiKeyItem[]> {
  return apiFetch<ApiKeyItem[]>(`/orgs/${orgId}/api-keys`);
}

export function createApiKey(
  orgId: string,
  input: { name: string; scopes?: string[]; ttl_days?: number | null },
): Promise<IssuedApiKey> {
  return apiFetch<IssuedApiKey>(`/orgs/${orgId}/api-keys`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function revokeApiKey(orgId: string, keyId: string): Promise<void> {
  await apiFetch<unknown>(`/orgs/${orgId}/api-keys/${keyId}/revoke`, {
    method: "POST",
  });
}
