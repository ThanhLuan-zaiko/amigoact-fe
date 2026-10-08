import type { CreateOrgInput, OrgKind } from "./api.ts";

export const ORG_KINDS: OrgKind[] = ["organization", "club", "group", "business"];

export type OrgFieldErrors = Partial<Record<"name" | "slug" | "description", string>>;

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
