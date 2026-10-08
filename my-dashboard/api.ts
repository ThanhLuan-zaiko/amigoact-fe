import { apiFetch } from "../core/api.ts";

export type OrgKind = "organization" | "club" | "group" | "business";

export interface DashboardOrg {
  id: string;
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
  member_count: number;
  event_count: number;
  created_at: string;
}

export interface CreateOrgInput {
  name: string;
  slug: string;
  description: string;
  kind: OrgKind;
}

export async function listMyOrgs(): Promise<DashboardOrg[]> {
  return apiFetch<DashboardOrg[]>("/orgs/mine");
}

export async function createOrg(input: CreateOrgInput): Promise<DashboardOrg> {
  return apiFetch<DashboardOrg>("/orgs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
