import { apiFetch } from "../core/api.ts";

export interface ActivitySummary {
  id: string;
  org_id: string;
  title: string;
  slug: string;
  status: string;
  start_at: string | null;
  category_id: string | null;
}

export interface ActivityDetail {
  id: string;
  org_id: string;
  title: string;
  slug: string;
  description: string;
  category_id: string | null;
  status: string;
  location: string | null;
  address: string | null;
  city: string | null;
  latitude: string | null;
  longitude: string | null;
  is_remote: boolean;
  max_participants: number | null;
  start_at: string | null;
  end_at: string | null;
  hours_awarded: number;
  registration_deadline: string | null;
  person_in_charge_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  org_scoped: boolean;
  default_hours: number | null;
}

export interface SkillEdgeDetail {
  skill_id: string;
  name: string;
  slug: string;
  is_required: boolean;
}

export interface PartnerDetail {
  org_id: string;
  name: string;
  role: string;
  note: string | null;
}

export interface StaffDetail {
  user_id: string;
  full_name: string;
  staff_role: string;
  assigned_at: string | null;
}

export interface ScheduleItem {
  id: string;
  title: string;
  location: string | null;
  start_at: string | null;
  end_at: string | null;
  status: string;
}

export interface AnnouncementItem {
  announcement_id: string;
  title: string;
  body: string;
  published_at: string;
}

export interface ActivityDetailView {
  activity: ActivityDetail;
  skills: SkillEdgeDetail[];
  partners: PartnerDetail[];
  staff: StaffDetail[];
  schedules: ScheduleItem[];
  announcements: AnnouncementItem[];
}

export interface ActivityInput {
  title: string;
  slug?: string | null;
  description?: string | null;
  category_id?: string | null;
  location?: string | null;
  address?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  is_remote: boolean;
  max_participants?: number | null;
  start_at: string;
  end_at?: string | null;
  hours_awarded: number;
  registration_deadline?: string | null;
  person_in_charge_id?: string | null;
}

export interface DiscoveryBucket {
  category_id: string;
  name: string;
  items: ActivitySummary[];
}

export interface DiscoveryResponse {
  featured: ActivitySummary[];
  upcoming: ActivitySummary[];
  categories: DiscoveryBucket[];
}

export function fetchDiscovery(limit = 6): Promise<DiscoveryResponse> {
  return apiFetch<DiscoveryResponse>(`/activities/discovery?limit=${limit}`);
}

export function listActivities(
  status = "published",
  categoryId?: string,
): Promise<ActivitySummary[]> {
  const params = new URLSearchParams({ status });
  if (categoryId) params.set("category_id", categoryId);
  return apiFetch<ActivitySummary[]>(`/activities?${params}`);
}

export function listCategories(orgId?: string): Promise<CategoryItem[]> {
  const params = orgId ? `?org_id=${orgId}` : "";
  return apiFetch<CategoryItem[]>(`/categories${params}`);
}

export function getActivity(activityId: string): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(`/activities/${activityId}`);
}

export function getActivityBySlug(
  orgId: string,
  slug: string,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(
    `/orgs/${orgId}/activities/by-slug/${slug}`,
  );
}

export function getActivityDetail(
  orgId: string,
  activityId: string,
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/detail`,
  );
}

export function listOrgActivities(
  orgId: string,
): Promise<ActivitySummary[]> {
  return apiFetch<ActivitySummary[]>(`/orgs/${orgId}/activities`);
}

export function createActivity(
  orgId: string,
  input: ActivityInput,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(`/orgs/${orgId}/activities`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateActivity(
  orgId: string,
  activityId: string,
  input: ActivityInput,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(
    `/orgs/${orgId}/activities/${activityId}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
}

export function transitionActivity(
  orgId: string,
  activityId: string,
  status: string,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(
    `/orgs/${orgId}/activities/${activityId}/status`,
    { method: "POST", body: JSON.stringify({ status }) },
  );
}

export function createCategory(
  orgId: string,
  input: {
    name: string;
    slug: string;
    description?: string | null;
    default_hours?: number | null;
  },
): Promise<CategoryItem> {
  return apiFetch<CategoryItem>(`/orgs/${orgId}/categories`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setActivitySkills(
  orgId: string,
  activityId: string,
  skills: { skill_id: string; is_required: boolean }[],
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/skills`,
    { method: "PUT", body: JSON.stringify({ skills }) },
  );
}

export function setActivityPartners(
  orgId: string,
  activityId: string,
  partners: { org_id: string; role: string; note?: string | null }[],
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/partners`,
    { method: "PUT", body: JSON.stringify({ partners }) },
  );
}

export function setActivityStaff(
  orgId: string,
  activityId: string,
  staff: { user_id: string; staff_role: string }[],
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/staff`,
    { method: "PUT", body: JSON.stringify({ staff }) },
  );
}

export function addSchedule(
  orgId: string,
  activityId: string,
  input: {
    title: string;
    location?: string | null;
    start_at?: string | null;
    end_at?: string | null;
  },
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/schedules`,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function deleteSchedule(
  orgId: string,
  activityId: string,
  scheduleId: string,
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/schedules/${scheduleId}`,
    { method: "DELETE" },
  );
}

export function addAnnouncement(
  orgId: string,
  activityId: string,
  input: { title: string; body?: string },
): Promise<ActivityDetailView> {
  return apiFetch<ActivityDetailView>(
    `/orgs/${orgId}/activities/${activityId}/announcements`,
    { method: "POST", body: JSON.stringify(input) },
  );
}
