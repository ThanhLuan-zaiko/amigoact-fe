import { apiFetch } from "../core/api.ts";
import type { ActivitySummary } from "./api.ts";

export interface MyActivityOrg {
  id: string;
  name: string;
  slug: string;
  kind: string;
  can_create: boolean;
  can_manage: boolean;
  // Trash, restore and erase rights (activity:delete, or activity:manage).
  can_delete: boolean;
  activity_count: number;
  // Public logo path (/media/...) or null when the org has no logo.
  logo_url: string | null;
}

export interface MyActivityItem extends ActivitySummary {
  can_manage: boolean;
  can_delete: boolean;
}

export interface MyActivitiesResponse {
  items: MyActivityItem[];
  orgs: MyActivityOrg[];
}

// Every activity across the caller's orgs. trash=true lists trashed rows of
// the orgs the caller can manage only.
export function listMyActivities(trash = false): Promise<MyActivitiesResponse> {
  return apiFetch<MyActivitiesResponse>(
    `/me/activities${trash ? "?trash=1" : ""}`,
  );
}
