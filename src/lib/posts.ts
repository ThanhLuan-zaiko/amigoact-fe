// Pure helpers for posts and their forms. The backend repeats every rule.
import type { FieldErrors } from "./account";
import type { ActivitySummary } from "./activities";
import { initials, type MyOrganization } from "./organizations";
import { hasLetter } from "./validation";

export const TAG_LIMIT = 5;
export const TAG_NAME_MAX = 40;
export const TITLE_MAX = 160;
export const BODY_MAX = 5000;
export const POST_MEDIA_LIMIT = 10;

export const POST_MESSAGES = {
  org: "Hãy chọn tổ chức để đăng bài.",
  title: "Vui lòng nhập tiêu đề (tối đa 160 ký tự).",
  titleLetter:
    "Tiêu đề cần có ít nhất một chữ cái, không chỉ gồm số hay ký hiệu.",
  comment: "Bình luận cần từ 1 đến 1000 ký tự.",
  body: "Vui lòng nhập nội dung (tối đa 5000 ký tự).",
  tagCount: "Mỗi bài có tối đa 5 thẻ.",
  tagLength: "Mỗi thẻ tối đa 40 ký tự.",
  tagContent: "Thẻ cần có ít nhất một chữ hoặc số.",
  membersMedia:
    "Bài chỉ dành cho thành viên không có ảnh hoặc video. Hãy chọn Công khai hoặc gỡ tệp.",
};

// Visibility left empty means the default of the kind, as in the backend.
export function effectiveVisibility(kind: string, visibility: string): string {
  if (visibility) {
    return visibility;
  }
  return kind === "announcement" ? "public" : "members";
}

// "a, b,,c" becomes ["a", "b", "c"]. Repeated tags are kept once, ignoring case.
export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const part of value.split(",")) {
    const tag = part.trim();
    const key = tag.toLowerCase();
    if (tag && !seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
  }
  return tags;
}

// Any active member may start a discussion. Only owners and admins announce.
export function postableOrganizations(
  organizations: MyOrganization[],
  kind: "announcement" | "discussion",
): MyOrganization[] {
  return organizations.filter(
    (org) =>
      org.status === "active" &&
      (kind === "discussion" || org.role === "owner" || org.role === "admin"),
  );
}

// The tag rules shared by posts and activities. Undefined when the list is fine.
export function tagListError(value: string): string | undefined {
  const tags = parseTags(value);
  if (tags.length > TAG_LIMIT) {
    return POST_MESSAGES.tagCount;
  }
  if (tags.some((tag) => tag.length > TAG_NAME_MAX)) {
    return POST_MESSAGES.tagLength;
  }
  if (tags.some((tag) => !/[\p{L}\p{N}]/u.test(tag))) {
    return POST_MESSAGES.tagContent;
  }
  return undefined;
}

export function validatePost(values: {
  // Empty when the organization comes from the page address instead of a field.
  org?: string;
  title: string;
  body: string;
  tags: string;
  kind?: string;
  visibility?: string;
  mediaCount?: number;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (values.org !== undefined && !values.org) {
    errors.org_slug = POST_MESSAGES.org;
  }
  const title = values.title.trim();
  if (!title || title.length > TITLE_MAX) {
    errors.post_title = POST_MESSAGES.title;
  } else if (!hasLetter(title)) {
    errors.post_title = POST_MESSAGES.titleLetter;
  }
  const body = values.body.trim();
  if (!body || body.length > BODY_MAX) {
    errors.post_body = POST_MESSAGES.body;
  }
  const tagError = tagListError(values.tags);
  if (tagError) {
    errors.post_tags = tagError;
  }
  if (
    (values.mediaCount ?? 0) > 0 &&
    effectiveVisibility(values.kind ?? "", values.visibility ?? "") ===
      "members"
  ) {
    errors.media_ids = POST_MESSAGES.membersMedia;
  }
  return errors;
}

// Backend field names differ from the form's, because "title" has another rule elsewhere.
const FIELD_RENAMES: Record<string, string> = {
  title: "post_title",
  body: "post_body",
  tags: "post_tags",
  media_ids: "media_ids",
};

export function renameIssueField(field: string): string {
  return FIELD_RENAMES[field] ?? field;
}

export const COMMENT_MAX = 1000;

export function validateComment(body: string): string | null {
  const text = body.trim();
  return text && text.length <= COMMENT_MAX ? null : POST_MESSAGES.comment;
}

// Managers may announce. Every active member may start a discussion.
export function postKinds(canManage: boolean): PostKind[] {
  return canManage ? ["announcement", "discussion"] : ["discussion"];
}

// Feed filters read from the address. Unknown values fall back to all posts.
export type FeedFilter = "all" | "announcement" | "discussion" | "pinned";

export function feedFilter(value: string | string[] | undefined): FeedFilter {
  return value === "announcement" ||
    value === "discussion" ||
    value === "pinned"
    ? value
    : "all";
}

// Post IDs are UUIDv7. Anything else in the address is a 404 without a backend call.
export function isPostId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

// A purge needs the exact title typed again, ignoring spaces around it.
export function purgeConfirmed(title: string, typed: string): boolean {
  return typed.trim() === title.trim() && title.trim().length > 0;
}

export function postPath(slug: string, id?: string): string {
  const base = `/organizations/${encodeURIComponent(slug)}/posts`;
  return id ? `${base}/${encodeURIComponent(id)}` : base;
}

export type PostKind = "announcement" | "discussion";

export type PostViewerApi = {
  can_edit: boolean;
  can_delete: boolean;
  can_pin: boolean;
  can_hide?: boolean;
  can_comment: boolean;
};

// Shapes of the post API responses.
export type PostApi = {
  id: string;
  kind: PostKind;
  visibility: "public" | "members";
  status: string;
  title: string;
  body: string;
  tags: string[];
  media: { id: string; url: string; mime: string }[];
  pinned: boolean;
  hidden?: boolean;
  comment_count: number;
  org: { slug: string; name: string };
  // The activity the post is about, if any.
  activity?: ActivitySummary | null;
  viewer?: PostViewerApi;
  created_at: string;
  published_at: string | null;
  edited_at?: string | null;
};

export type PostPageApi = { items: PostApi[]; next_before: string | null };

export type CommentApi = {
  id: string;
  body: string;
  author_name: string;
  deleted: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_restore: boolean;
  created_at: string;
  edited_at: string | null;
};

export type CommentPageApi = { items: CommentApi[]; next_after: string | null };

export type TrashPostApi = {
  id: string;
  kind: PostKind;
  visibility: "public" | "members";
  title: string;
  deleted_at: string;
  purge_at: string;
  deleted_by_name: string | null;
  can_purge: boolean;
};

export type TrashPageApi = {
  items: TrashPostApi[];
  next_before: string | null;
};

const NO_RIGHTS: PostViewerApi = {
  can_edit: false,
  can_delete: false,
  can_pin: false,
  can_comment: false,
};

// Pictures are served by the frontend at /media/{id}/file, not by the backend path in `url`.
export function toPost(post: PostApi, formatDate: (value: string) => string) {
  return {
    id: post.id,
    slug: post.org.slug,
    status: post.status,
    viewer: post.viewer ?? NO_RIGHTS,
    edited: Boolean(post.edited_at),
    organizationName: post.org.name,
    organizationInitials: initials(post.org.name),
    kind: post.kind,
    visibility: post.visibility,
    publishedAt: formatDate(post.published_at ?? post.created_at),
    title: post.title,
    body: post.body,
    tags: post.tags,
    commentCount: post.comment_count,
    pinned: post.pinned,
    hidden: post.hidden ?? false,
    activity: post.activity ?? null,
    media: post.media.map((item) => ({
      id: item.id.toLowerCase(),
      src: `/media/${item.id}/file`,
      isVideo: item.mime.startsWith("video/"),
    })),
  };
}
