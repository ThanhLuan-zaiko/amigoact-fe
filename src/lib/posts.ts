// Pure helpers for the compose form. The backend repeats every rule.
import type { FieldErrors } from "./account";
import { initials, type MyOrganization } from "./organizations";

export const TAG_LIMIT = 3;
export const TAG_NAME_MAX = 40;
export const TITLE_MAX = 160;
export const BODY_MAX = 5000;
export const POST_MEDIA_LIMIT = 10;

export const POST_MESSAGES = {
  org: "Hãy chọn tổ chức để đăng bài.",
  title: "Vui lòng nhập tiêu đề (tối đa 160 ký tự).",
  body: "Vui lòng nhập nội dung (tối đa 5000 ký tự).",
  tagCount: "Mỗi bài có tối đa 3 thẻ.",
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

export function validatePost(values: {
  org: string;
  title: string;
  body: string;
  tags: string;
  kind?: string;
  visibility?: string;
  mediaCount?: number;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.org) {
    errors.org_slug = POST_MESSAGES.org;
  }
  const title = values.title.trim();
  if (!title || title.length > TITLE_MAX) {
    errors.post_title = POST_MESSAGES.title;
  }
  const body = values.body.trim();
  if (!body || body.length > BODY_MAX) {
    errors.post_body = POST_MESSAGES.body;
  }
  const tags = parseTags(values.tags);
  if (tags.length > TAG_LIMIT) {
    errors.post_tags = POST_MESSAGES.tagCount;
  } else if (tags.some((tag) => tag.length > TAG_NAME_MAX)) {
    errors.post_tags = POST_MESSAGES.tagLength;
  } else if (tags.some((tag) => !/[\p{L}\p{N}]/u.test(tag))) {
    errors.post_tags = POST_MESSAGES.tagContent;
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

// Shapes of the post API responses.
export type PostApi = {
  id: string;
  kind: "announcement" | "discussion";
  visibility: "public" | "members";
  status: string;
  title: string;
  body: string;
  tags: string[];
  media: { id: string; url: string; mime: string }[];
  pinned: boolean;
  comment_count: number;
  org: { slug: string; name: string };
  created_at: string;
  published_at: string | null;
};

export type PostPageApi = { items: PostApi[]; next_before: string | null };

// Pictures are served by the frontend at /media/{id}/file, not by the backend path in `url`.
export function toPost(post: PostApi, formatDate: (value: string) => string) {
  return {
    id: post.id,
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
    media: post.media.map((item) => ({
      src: `/media/${item.id}/file`,
      isVideo: item.mime.startsWith("video/"),
    })),
  };
}
