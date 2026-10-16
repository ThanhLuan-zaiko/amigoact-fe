import type { PublicOrgParams } from "./api.ts";

export const orgKeys = {
  all: ["orgs"] as const,
  directory: (params: PublicOrgParams) =>
    [...orgKeys.all, "directory", params] as const,
  detail: (slug: string) => [...orgKeys.all, "detail", slug] as const,
  posts: (slug: string, page: number) =>
    [...orgKeys.all, "posts", slug, page] as const,
  feed: () => [...orgKeys.all, "feed"] as const,
  media: (slug: string) => [...orgKeys.all, "media", slug] as const,
  postMedia: (slug: string, postId: string) =>
    [...orgKeys.all, "post-media", slug, postId] as const,
  postMediaAll: () => [...orgKeys.all, "post-media"] as const,
  orgDetails: () => [...orgKeys.all, "detail"] as const,
  orgPosts: () => [...orgKeys.all, "posts"] as const,
};
