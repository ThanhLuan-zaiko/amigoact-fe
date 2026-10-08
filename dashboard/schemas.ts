import type { CreateOrgInput, MediaRole, OrgKind } from "./api.ts";

export const ORG_KINDS: OrgKind[] = ["organization", "club", "group", "business"];

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
  Record<"name" | "slug" | "description" | "taxCode" | "legalRepName" | "legalRepId", string>
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
  }
  return errors;
}

export interface UpdateOrgForm {
  name: string;
  description: string;
}

export type UpdateFieldErrors = Partial<Record<"name" | "description", string>>;

export function validateUpdateForm(form: UpdateOrgForm): UpdateFieldErrors {
  const errors: UpdateFieldErrors = {};
  const name = form.name.trim();
  if (name.length < 2 || name.length > 100) errors.name = "INVALID_NAME";
  if (form.description.trim().length > 500) errors.description = "INVALID_DESCRIPTION";
  return errors;
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
