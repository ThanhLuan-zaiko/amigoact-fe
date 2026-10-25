import { apiFetch, apiUpload } from "../core/api.ts";

export interface SkillItem {
  id: string;
  name: string;
  slug: string;
}

export interface SkillEdge extends SkillItem {
  level: number;
}

export interface ContactItem {
  contact_id: string;
  name: string;
  relation: string | null;
  phone: string;
  is_primary: boolean;
}

export interface VolunteerProfile {
  student_code: string | null;
  campus_id: string | null;
  department_id: string | null;
  class_name: string | null;
  enrollment_year: number | null;
  school_name: string | null;
  bio: string | null;
  interests: string[];
  status: string | null;
  total_hours: number;
  updated_at: string | null;
  skills: SkillEdge[];
  contacts: ContactItem[];
  avatar_url: string | null;
}

export interface ProfilePayload {
  student_code: string | null;
  campus_id: string | null;
  department_id: string | null;
  class_name: string | null;
  enrollment_year: number | null;
  school_name: string | null;
  bio: string | null;
  interests: string[];
  status: string | null;
}

// One row of the full-replace contact list. A null contact_id is a new row.
export interface ContactDraft {
  contact_id: string | null;
  name: string;
  relation: string | null;
  phone: string;
}

export interface PublicVolunteer {
  full_name: string;
  school_name: string | null;
  class_name: string | null;
  bio: string | null;
  interests: string[];
  total_hours: number;
  skills: SkillEdge[];
  avatar_url: string | null;
  member_since: string | null;
}

export async function listSkills(): Promise<SkillItem[]> {
  return apiFetch<SkillItem[]>("/skills");
}

export async function getMyProfile(): Promise<VolunteerProfile> {
  return apiFetch<VolunteerProfile>("/profiles/me");
}

export async function updateMyProfile(
  payload: ProfilePayload,
): Promise<VolunteerProfile> {
  return apiFetch<VolunteerProfile>("/profiles/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function setMySkills(
  skills: { skill_id: string; level: number }[],
): Promise<VolunteerProfile> {
  return apiFetch<VolunteerProfile>("/profiles/me/skills", {
    method: "PUT",
    body: JSON.stringify({ skills }),
  });
}

export async function replaceMyContacts(
  contacts: ContactDraft[],
): Promise<VolunteerProfile> {
  return apiFetch<VolunteerProfile>("/profiles/me/contacts", {
    method: "PUT",
    body: JSON.stringify({ contacts }),
  });
}

export async function uploadMyAvatar(
  file: File,
): Promise<{ avatar_url: string }> {
  const form = new FormData();
  form.append("file", file);
  return apiUpload<{ avatar_url: string }>("/profiles/me/avatar", form);
}

export async function getPublicProfile(
  userId: string,
): Promise<PublicVolunteer> {
  return apiFetch<PublicVolunteer>(`/profiles/${userId}`);
}
