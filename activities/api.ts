import { apiFetch } from "../core/api.ts";

export interface TagRef {
  name: string;
  slug: string;
}

export interface ActivitySummary {
  id: string;
  org_id: string;
  title: string;
  slug: string;
  status: string;
  start_at: string | null;
  category_id: string | null;
  tags: TagRef[];
  deleted_at: string | null;
  location: string | null;
  is_remote: boolean;
  hours_awarded: number;
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
  tags: TagRef[];
  deleted_at: string | null;
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
  tags?: string[];
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
  trash = false,
): Promise<ActivitySummary[]> {
  return apiFetch<ActivitySummary[]>(
    `/orgs/${orgId}/activities${trash ? "?trash=1" : ""}`,
  );
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

export function softDeleteActivity(
  orgId: string,
  activityId: string,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(
    `/orgs/${orgId}/activities/${activityId}`,
    { method: "DELETE" },
  );
}

export function hardDeleteActivity(
  orgId: string,
  activityId: string,
): Promise<void> {
  return apiFetch<void>(
    `/orgs/${orgId}/activities/${activityId}?hard=1`,
    { method: "DELETE" },
  );
}

export function restoreActivity(
  orgId: string,
  activityId: string,
): Promise<ActivityDetail> {
  return apiFetch<ActivityDetail>(
    `/orgs/${orgId}/activities/${activityId}/restore`,
    { method: "POST" },
  );
}

export interface FormQuestion {
  question_id: string;
  label: string;
  field_type: string;
  required: boolean;
}

export interface FormQuestionInput {
  label: string;
  field_type: string;
  required: boolean;
}

export function getRegistrationForm(
  orgId: string,
  activityId: string,
): Promise<FormQuestion[]> {
  return apiFetch<FormQuestion[]>(
    `/orgs/${orgId}/activities/${activityId}/form`,
  );
}

export function setRegistrationForm(
  orgId: string,
  activityId: string,
  questions: FormQuestionInput[],
): Promise<FormQuestion[]> {
  return apiFetch<FormQuestion[]>(
    `/orgs/${orgId}/activities/${activityId}/form`,
    { method: "PUT", body: JSON.stringify({ questions }) },
  );
}
