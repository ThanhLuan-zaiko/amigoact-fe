export interface TagChoice {
  name: string;
  slug: string;
  detail?: string;
}

// Current-org rows first. A slug already here is not offered again from
// another owned org, even when that org spells it differently.
export function mergeTagSuggestions(
  local: { name: string; slug: string }[],
  owned: { name: string; slug: string; org_name: string }[],
): TagChoice[] {
  const slugs = new Set(local.map((tag) => tag.slug));
  return [
    ...local.map((tag) => ({ name: tag.name, slug: tag.slug })),
    ...owned
      .filter((tag) => !slugs.has(tag.slug))
      .map((tag) => ({
        name: tag.name,
        slug: tag.slug,
        detail: tag.org_name,
      })),
  ];
}
