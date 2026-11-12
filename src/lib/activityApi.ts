import "server-only";
import type {
  ActivityDetail,
  ActivityPage,
  ActivitySummary,
  MyRegistration,
  RegistrationPage,
} from "./activities";
import {
  type ActivityFilter,
  type ActivityTrashPage,
  backendStatus,
} from "./activityList";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import { PAGE_SIZE } from "./pagination";
import { linkableActivities } from "./postActivity";

// Read these behind a Suspense boundary, because they use the session or route params.
export async function getActivity(id: string): Promise<ActivityDetail | null> {
  const result = await backendFetch<ActivityDetail>(
    `/activities/${encodeURIComponent(id)}`,
    { method: "GET", token: await getAccessToken() },
  );
  if (result.ok) {
    return result.data;
  }
  if (result.status === 404 || result.status === 422) {
    return null;
  }
  throw new Error(`Could not load the activity: ${result.code}`);
}

export async function listPublicActivities(
  search: string,
  city: string,
  offset: number,
  limit = PAGE_SIZE,
): Promise<ActivityPage | null> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (search) {
    query.set("q", search);
  }
  if (city) {
    query.set("city", city);
  }
  const result = await backendFetch<ActivityPage>(`/activities?${query}`, {
    method: "GET",
  });
  return result.ok ? result.data : null;
}

// A tab of the list. Drafts are only for managers; others get null.
export async function listOrganizationActivities(
  slug: string,
  offset: number,
  filter: ActivityFilter | "draft" = "all",
  tag: string | null = null,
): Promise<ActivityPage | null> {
  const query = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  if (tag) {
    query.set("tag", tag);
  }
  const status = backendStatus(filter);
  if (status) {
    query.set("status", status);
  }
  const result = await backendFetch<ActivityPage>(
    `/organizations/${encodeURIComponent(slug)}/activities?${query}`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? result.data : null;
}

export async function getActivityTrash(
  slug: string,
  before: string | null,
): Promise<ActivityTrashPage | null> {
  const query = new URLSearchParams({ limit: "20" });
  if (before) {
    query.set("before", before);
  }
  const result = await backendFetch<ActivityTrashPage>(
    `/organizations/${encodeURIComponent(slug)}/activity-trash?${query}`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? result.data : null;
}

// Activities a post of this organization may point at, newest first.
export async function getLinkableActivities(
  slug: string,
): Promise<ActivitySummary[]> {
  const result = await backendFetch<ActivityPage>(
    `/organizations/${encodeURIComponent(slug)}/activities?limit=100`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? linkableActivities(result.data.items) : [];
}

export async function getMyRegistrations(): Promise<MyRegistration[]> {
  const result = await backendFetch<MyRegistration[]>("/registrations/mine", {
    method: "GET",
    token: await getAccessToken(),
  });
  return result.ok ? result.data : [];
}

export async function getActivityRegistrations(
  id: string,
  status: string,
  offset: number,
): Promise<RegistrationPage | null> {
  const query = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  if (status) {
    query.set("status", status);
  }
  const result = await backendFetch<RegistrationPage>(
    `/activities/${encodeURIComponent(id)}/registrations?${query}`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? result.data : null;
}
