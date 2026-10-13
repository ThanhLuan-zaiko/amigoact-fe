import type { PublicOrgParams } from "./api.ts";

export const orgKeys = {
  all: ["orgs"] as const,
  directory: (params: PublicOrgParams) =>
    [...orgKeys.all, "directory", params] as const,
  detail: (slug: string) => [...orgKeys.all, "detail", slug] as const,
  posts: (slug: string, page: number) =>
    [...orgKeys.all, "posts", slug, page] as const,
};
