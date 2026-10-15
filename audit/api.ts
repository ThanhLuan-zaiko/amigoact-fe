import { apiFetch } from "../core/api.ts";

export interface AuditEntry {
  log_id: string;
  occurred_at: string;
  actor_id: string;
  actor_name: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  result: string;
  detail: string | null;
}

interface AuditFeedResponse {
  items: AuditEntry[];
}

export async function listOrgAudit(
  orgId: string,
  limit = 50,
): Promise<AuditEntry[]> {
  const data = await apiFetch<AuditFeedResponse>(
    `/orgs/${orgId}/audit?limit=${limit}`,
  );
  return data.items;
}
