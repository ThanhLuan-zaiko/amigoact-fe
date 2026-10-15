import type { CreateOrgInput, DashboardOrg, MediaRole, OrgKind } from "./api.ts";

export const ORG_KINDS: OrgKind[] = ["organization", "club", "group", "business"];

// Pending legal review wins over the base status; anything unexpected
// falls through so the toolbar can surface it as its own filter chip.
export function orgStatusBucket(org: DashboardOrg): string {
  if (org.legal_status === "pending") return "pending";
  return org.status || "active";
}

export interface PendingMedia {
  file: File;
  role: MediaRole;
  cropped: boolean;
  decodable?: boolean;
}

export function assignMediaRole(
  items: PendingMedia[],
  index: number,
  role: MediaRole,
): PendingMedia[] {
  return items.map((item, i) => ({
    ...item,
    role: i === index ? role : role !== "gallery" && item.role === role ? "gallery" : item.role,
  }));
}

export function defaultAspectForRole(role: MediaRole): number {
  if (role === "logo") return 1;
  if (role === "cover") return 3;
  return 16 / 9;
}

export type OrgFieldErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "description"
    | "taxCode"
    | "legalRepName"
    | "legalRepId"
    | "legalRepPosition",
    string
  >
>;

const TAX_PATTERN = /^\d{10}(-\d{3})?$/;
const CCCD_PATTERN = /^\d{12}$/;

export function validateTaxCodeValue(value: string): string | null {
  const code = value.trim();
  if (code.length === 0) return "REQUIRED";
  if (!TAX_PATTERN.test(code)) return "INVALID_TAX_CODE";
  if (new Set(code.replace("-", "")).size === 1) return "INVALID_TAX_CODE";
  return null;
}

export function validateCccdValue(value: string): string | null {
  const code = value.trim();
  if (code.length === 0) return "REQUIRED";
  if (!CCCD_PATTERN.test(code)) return "INVALID_CCCD";
  if (new Set(code).size === 1) return "INVALID_CCCD";
  return null;
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

// Baseline for the create-org form and for its unsaved-changes guard.
export function emptyOrgForm(): CreateOrgInput {
  return {
    name: "",
    slug: "",
    description: "",
    kind: "organization",
    join_policy: "invite",
    tax_code: "",
    legal_rep_name: "",
    legal_rep_id: "",
    legal_rep_position: "",
  };
}

export function orgFormDirty(form: CreateOrgInput): boolean {
  const empty = emptyOrgForm();
  return Object.entries(form).some(
    ([key, value]) => value !== empty[key as keyof CreateOrgInput],
  );
}

// SearchParams patch for the create form's ?kind= deep link: the default kind
// leaves no trace in the URL.
export function kindSearchParams(prev: URLSearchParams, kind: OrgKind): URLSearchParams {
  const next = new URLSearchParams(prev);
  if (kind === "organization") next.delete("kind");
  else next.set("kind", kind);
  return next;
}

export function validateOrgField(form: CreateOrgInput, key: keyof CreateOrgInput): string | null {
  if (key === "name") {
    const name = form.name.trim();
    if (name.length < 2 || name.length > 100) return "INVALID_NAME";
    return null;
  }
  if (key === "slug") {
    const slug = form.slug.trim().toLowerCase();
    if (slug.length < 2 || slug.length > 60 || !isValidSlug(slug)) return "INVALID_SLUG";
    return null;
  }
  if (key === "description") {
    const description = form.description.trim();
    if (description.length > 500) return "INVALID_DESCRIPTION";
    return null;
  }
  if (key === "tax_code") {
    return form.kind === "business" ? validateTaxCodeValue(form.tax_code ?? "") : null;
  }
  if (key === "legal_rep_name") {
    if (form.kind !== "business") return null;
    const rep = (form.legal_rep_name ?? "").trim();
    return rep.length >= 2 && rep.length <= 100 ? null : "INVALID_LEGAL_REP";
  }
  if (key === "legal_rep_id") {
    return form.kind === "business" ? validateCccdValue(form.legal_rep_id ?? "") : null;
  }
  if (key === "legal_rep_position") {
    if (form.kind !== "business") return null;
    const position = (form.legal_rep_position ?? "").trim();
    if (position.length === 0) return null;
    return position.length >= 2 && position.length <= 100
      ? null
      : "INVALID_LEGAL_REP_POSITION";
  }
  return null;
}

export function validateOrgForm(form: CreateOrgInput): OrgFieldErrors {
  const errors: OrgFieldErrors = {};
  const name = validateOrgField(form, "name");
  if (name) errors.name = name;
  const slug = validateOrgField(form, "slug");
  if (slug) errors.slug = slug;
  const description = validateOrgField(form, "description");
  if (description) errors.description = description;
  if (form.kind === "business") {
    const tax = validateOrgField(form, "tax_code");
    if (tax) errors.taxCode = tax;
    const rep = validateOrgField(form, "legal_rep_name");
    if (rep) errors.legalRepName = rep;
    const cccd = validateOrgField(form, "legal_rep_id");
    if (cccd) errors.legalRepId = cccd;
    const position = validateOrgField(form, "legal_rep_position");
    if (position) errors.legalRepPosition = position;
  }
  return errors;
}

export interface UpdateOrgForm {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  legal_name: string;
  license_number: string;
}

export type ContactKey = keyof Omit<UpdateOrgForm, "name" | "description">;

// Contact block shared by create and edit forms; both keep the raw strings.
export type ContactForm = Pick<UpdateOrgForm, ContactKey>;

export const CONTACT_FIELD_MAX: Record<string, number> = {
  address: 255,
  city: 100,
  country: 100,
  legal_name: 255,
  license_number: 100,
};

export type UpdateFieldErrors = Partial<
  Record<keyof UpdateOrgForm, string>
>;

const CONTACT_EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ORG_PHONE_PATTERN = /^[0-9+\-().\s]{5,20}$/;
const WEBSITE_PATTERN =
  /^(https?:\/\/)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/\S*)?$/i;

export function validateContactField(
  form: ContactForm,
  key: ContactKey,
): string | null {
  const value = form[key].trim();
  if (value.length === 0) return null;
  if (key === "email") {
    if (value.length > 254 || !CONTACT_EMAIL_PATTERN.test(value))
      return "INVALID_CONTACT_EMAIL";
    return null;
  }
  if (key === "phone") {
    return ORG_PHONE_PATTERN.test(value) ? null : "INVALID_ORG_PHONE";
  }
  if (key === "website") {
    if (value.length > 255 || !WEBSITE_PATTERN.test(value))
      return "INVALID_WEBSITE";
    return null;
  }
  const max = CONTACT_FIELD_MAX[key];
  return max !== undefined && value.length > max ? "INVALID_CONTACT_FIELD" : null;
}

export function validateUpdateForm(form: UpdateOrgForm): UpdateFieldErrors {
  const errors: UpdateFieldErrors = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 100) errors.name = "INVALID_NAME";
  if (form.description.trim().length > 500) errors.description = "INVALID_DESCRIPTION";
  for (const key of Object.keys(CONTACT_FIELD_MAX).concat(["email", "phone", "website"]) as ContactKey[]) {
    const invalid = validateContactField(form, key);
    if (invalid) errors[key] = invalid;
  }
  return errors;
}

// Accent-folded matching for pickers; mirrors the backend search fold.
export function foldText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d");
}

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateInviteEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (email.length === 0) return "REQUIRED";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "INVALID_EMAIL";
  return null;
}

export function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/bmp",
  "image/tiff",
  "image/heic",
  "image/heif",
];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
// Windows often reports no mime for these extensions; the backend
// transcodes them, so accept by filename when file.type is empty.
const IMAGE_EXTS = [".heic", ".heif", ".tiff", ".tif", ".bmp", ".avif"];

export function isSupportedMedia(file: File): boolean {
  const type = file.type.split(";")[0].trim().toLowerCase();
  if (IMAGE_TYPES.includes(type)) return file.size <= MAX_IMAGE_BYTES;
  if (VIDEO_TYPES.includes(type)) return file.size <= MAX_VIDEO_BYTES;
  if (type === "") {
    const ext = `.${file.name.split(".").pop() ?? ""}`.toLowerCase();
    if (IMAGE_EXTS.includes(ext)) return file.size <= MAX_IMAGE_BYTES;
  }
  return false;
}
