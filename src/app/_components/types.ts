// View models for the UI, filled from the API by toPost in src/lib/posts.ts.

import type { ActivitySummary } from "@/lib/activities";

export type PostKind = "announcement" | "discussion";

export type PostVisibility = "public" | "members";

export type Post = {
  // The activity the post is about, if any.
  activity?: ActivitySummary | null;
  id: string;
  // The organization slug, for links to the post and its organization.
  slug: string;
  status: string;
  viewer: {
    can_edit: boolean;
    can_delete: boolean;
    can_pin: boolean;
    can_hide?: boolean;
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
  // Hidden from the feed by a manager. Only managers still get it.
  hidden?: boolean;
  media?: PostMedia[];
};

export type PostMedia = { id: string; src: string; isVideo: boolean };
