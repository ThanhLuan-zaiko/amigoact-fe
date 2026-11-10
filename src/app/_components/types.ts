// View models for the UI. Filled from the API once it exists.

export type PostKind = "announcement" | "discussion";

export type PostVisibility = "public" | "members";

export type Post = {
  id: string;
  organizationName: string;
  organizationInitials: string;
  kind: PostKind;
  visibility: PostVisibility;
  publishedAt: string;
  title: string;
  body: string;
  tags: string[];
  commentCount: number;
  pinned?: boolean;
  media?: { src: string; isVideo: boolean }[];
};
