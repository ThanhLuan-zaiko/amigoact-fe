import type {
  ContactDraft,
  ContactItem,
  SkillEdge,
  VolunteerProfile,
} from "./api.ts";
import { profilePayload, type ProfileDraft } from "./validate.ts";

export const MAX_CONTACTS = 3;

export interface ContactInput {
  name: string;
  relation: string;
  phone: string;
}

// Everything the volunteer form can edit, held until the single save.
export interface VolunteerDraft {
  profile: ProfileDraft;
  skills: Record<string, number>;
  contacts: ContactDraft[];
  contactInput: ContactInput;
}

// One comparable key per section: the exact body that section would send.
// "Dirty" means the draft key differs from the key of the last saved state.
export interface SavedKeys {
  profile: string;
  skills: string;
  contacts: string;
}

export const EMPTY_CONTACT_INPUT: ContactInput = {
  name: "",
  relation: "",
  phone: "",
};

export function profileDraftOf(profile: VolunteerProfile): ProfileDraft {
  return {
    status: profile.status ?? "",
    studentCode: profile.student_code ?? "",
    campusId: profile.campus_id ?? "",
    departmentId: profile.department_id ?? "",
    className: profile.class_name ?? "",
    year: profile.enrollment_year?.toString() ?? "",
    school: profile.school_name ?? "",
    bio: profile.bio ?? "",
    interests: profile.interests.join(", "),
  };
}

export function skillsOf(skills: SkillEdge[]): Record<string, number> {
  return Object.fromEntries(skills.map((edge) => [edge.id, edge.level]));
}

// Primary first: the first row is the primary contact once saved.
export function contactsOf(items: ContactItem[]): ContactDraft[] {
  return [...items]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((item) => ({
      contact_id: item.contact_id,
      name: item.name,
      relation: item.relation,
      phone: item.phone,
    }));
}

export function contactFromInput(input: ContactInput): ContactDraft {
  return {
    contact_id: null,
    name: input.name.trim(),
    relation: input.relation.trim() || null,
    phone: input.phone.trim(),
  };
}

export function hasContactInput(input: ContactInput): boolean {
  return Object.values(input).some((value) => value.trim() !== "");
}

export function skillsPayload(
  skills: Record<string, number>,
): { skill_id: string; level: number }[] {
  return Object.keys(skills)
    .sort()
    .map((skill_id) => ({ skill_id, level: skills[skill_id] }));
}

export function contactsKey(contacts: ContactDraft[]): string {
  return JSON.stringify(
    contacts.map((c) => [c.contact_id, c.name, c.relation, c.phone]),
  );
}

export function keysOf(draft: VolunteerDraft): SavedKeys {
  return {
    profile: JSON.stringify(profilePayload(draft.profile)),
    skills: JSON.stringify(skillsPayload(draft.skills)),
    contacts: contactsKey(draft.contacts),
  };
}

export function draftOf(profile: VolunteerProfile): VolunteerDraft {
  return {
    profile: profileDraftOf(profile),
    skills: skillsOf(profile.skills),
    contacts: contactsOf(profile.contacts),
    contactInput: EMPTY_CONTACT_INPUT,
  };
}

export function savedKeysOf(profile: VolunteerProfile): SavedKeys {
  return keysOf(draftOf(profile));
}
