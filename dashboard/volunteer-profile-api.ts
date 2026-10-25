import { apiFetch } from "../core/api.ts";

export interface MemberVolunteerSkill {
  id: string;
  name: string;
  level: number;
}

export interface MemberVolunteerContact {
  name: string;
  relation: string | null;
  phone: string;
  is_primary: boolean;
}

export interface MemberVolunteerProfile {
  user_id: string;
  student_code: string | null;
  class_name: string | null;
  enrollment_year: number | null;
  school_name: string | null;
  bio: string | null;
  interests: string[];
  status: string | null;
  total_hours: number;
  skills: MemberVolunteerSkill[];
  contacts: MemberVolunteerContact[];
}

// Manager-only read: the backend checks member:view and audits every call.
export async function getMemberVolunteerProfile(
  orgId: string,
  userId: string,
): Promise<MemberVolunteerProfile> {
  return apiFetch<MemberVolunteerProfile>(
    `/orgs/${orgId}/members/${userId}/volunteer-profile`,
  );
}
