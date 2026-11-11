// View models for the UI, filled from the API by toPost in src/lib/posts.ts.

export type PostKind = "announcement" | "discussion";

export type PostVisibility = "public" | "members";

export type Post = {
  id: string;
  // The organization slug, for links to the post and its organization.
  slug: string;
  status: string;
  viewer: {
    can_edit: boolean;
    can_delete: boolean;
    can_pin: boolean;
    can_comment: boolean;
  };
  edited: boolean;
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
