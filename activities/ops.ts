import { apiFetch } from "../core/api.ts";
import type { ActivityDetailView } from "./api.ts";

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
