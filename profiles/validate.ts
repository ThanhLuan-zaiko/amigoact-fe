import type { ProfilePayload } from "./api.ts";

export interface ProfileDraft {
  status: string;
  studentCode: string;
  campusId: string;
  departmentId: string;
  className: string;
  year: string;
  school: string;
  bio: string;
  interests: string;
}

const STUDENT_STATUSES = new Set(["studying", "suspended"]);

function interestList(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsedYear(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  return Number(trimmed);
}

// Mirrors ProfileBody: student statuses need the student trio, graduated
// needs a school, and every other status needs at least one field.
export function profileFieldErrors(draft: ProfileDraft): Record<string, string> {
  const year = parsedYear(draft.year);
  const interests = interestList(draft.interests);
  const errors: Record<string, string> = {};
  const isStudent = STUDENT_STATUSES.has(draft.status);
  const needsSchool = isStudent || draft.status === "graduated";
  if (isStudent) {
    if (draft.studentCode.trim() === "")
      errors.student_code = "STUDENT_CODE_REQUIRED";
    if (draft.className.trim() === "") errors.class_name = "CLASS_NAME_REQUIRED";
  }
  if (needsSchool && draft.school.trim() === "")
    errors.school_name = "SCHOOL_NAME_REQUIRED";
  if (year !== null && (!Number.isInteger(year) || year < 1950 || year > 2100))
    errors.enrollment_year = "YEAR_RANGE";
  if (interests.length > 20) errors.interests = "TOO_MANY_INTERESTS";
  const hasInfo =
    draft.studentCode.trim() !== "" ||
    draft.className.trim() !== "" ||
    draft.school.trim() !== "" ||
    draft.bio.trim() !== "" ||
    interests.length > 0 ||
    year !== null;
  if (!hasInfo && Object.keys(errors).length === 0) errors.form = "PROFILE_EMPTY";
  return errors;
}

export function profilePayload(draft: ProfileDraft): ProfilePayload {
  return {
    student_code: draft.studentCode.trim() || null,
    campus_id: draft.campusId || null,
    department_id: draft.departmentId || null,
    class_name: draft.className.trim() || null,
    enrollment_year: parsedYear(draft.year),
    school_name: draft.school.trim() || null,
    bio: draft.bio.trim() || null,
    interests: interestList(draft.interests),
    status: draft.status === "" ? null : draft.status,
  };
}

export function contactFieldErrors(name: string, phone: string): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  if (trimmedName === "") errors.contact_name = "CONTACT_NAME_REQUIRED";
  if (trimmedPhone === "") errors.contact_phone = "CONTACT_PHONE_REQUIRED";
  else if (trimmedPhone.length < 8 || trimmedPhone.length > 20)
    errors.contact_phone = "CONTACT_PHONE_LENGTH";
  return errors;
}
