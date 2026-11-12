import "server-only";
import { formatDateTime } from "./activities";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import { getMyOrganizations } from "./organizationApi";
import {
  type CommentPageApi,
  type FeedFilter,
  type PostApi,
  type PostPageApi,
  type TrashPageApi,
  toPost,
} from "./posts";

// Read every function here behind a Suspense boundary. The viewer's token goes
// along when there is one, so members see member posts and their own rights.

function orgPath(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}`;
}

async function getJson<T>(path: string): Promise<T | null> {
  const token = await getAccessToken();
  const result = await backendFetch<T>(
    path,
    token ? { method: "GET", token } : { method: "GET" },
  );
  return result.ok ? result.data : null;
}

function toPage(page: PostPageApi | null) {
  if (!page) {
    return null;
  }
  return {
    posts: page.items.map((post) => toPost(post, formatDateTime)),
    nextBefore: page.next_before,
  };
}

export type PostListPage = NonNullable<ReturnType<typeof toPage>>;

export async function getOrgPosts(
  slug: string,
  filter: FeedFilter,
  before: string | null,
  limit = 20,
  tag: string | null = null,
): Promise<PostListPage | null> {
  const query = new URLSearchParams({ limit: String(limit) });
  if (tag) {
    query.set("tag", tag);
  }
  if (filter === "announcement" || filter === "discussion") {
    query.set("kind", filter);
  }
  if (filter === "pinned") {
    query.set("pinned_only", "true");
  }
  if (before) {
    query.set("before", before);
  }
  return toPage(await getJson<PostPageApi>(`${orgPath(slug)}/posts?${query}`));
}

// Null when the post is missing, deleted, or hidden from this viewer.
export async function getPost(id: string) {
  const post = await getJson<PostApi>(`/posts/${encodeURIComponent(id)}`);
  return post ? toPost(post, formatDateTime) : null;
}

// The raw post, for the edit form, which needs the exact stored values.
export async function getPostForEdit(id: string): Promise<PostApi | null> {
  return getJson<PostApi>(`/posts/${encodeURIComponent(id)}`);
}

export async function getComments(postId: string, after: string | null) {
  const query = new URLSearchParams({ limit: "100" });
  if (after) {
    query.set("after", after);
  }
  return getJson<CommentPageApi>(
    `/posts/${encodeURIComponent(postId)}/comments?${query}`,
  );
}

export async function getOrgDrafts(slug: string) {
  return toPage(
    await getJson<PostPageApi>(`${orgPath(slug)}/post-drafts?limit=50`),
  );
}

export async function getPostTrash(slug: string, before: string | null) {
  const query = new URLSearchParams({ limit: "20" });
  if (before) {
    query.set("before", before);
  }
  return getJson<TrashPageApi>(`${orgPath(slug)}/post-trash?${query}`);
}

// "mine" is every organization the viewer belongs to, "public" is everyone's public posts.
export async function getFeed(
  tab: "mine" | "public",
  before: string | null,
  tag: string | null = null,
): Promise<PostListPage | null> {
  const query = new URLSearchParams({ limit: "20" });
  if (tag) {
    query.set("tag", tag);
  }
  if (before) {
    query.set("before", before);
  }
  const path = tab === "mine" ? "/feed" : "/feed/public";
  return toPage(await getJson<PostPageApi>(`${path}?${query}`));
}

export async function getPopularTags(): Promise<string[]> {
  const result = await getJson<{ items: { name: string }[] }>(
    "/feed/popular-tags",
  );
  return result ? result.items.map((tag) => tag.name) : [];
}

// The signed-in user's drafts in every organization they are an active member of.
// A failed organization is skipped, so one broken request does not hide the others.
export async function getMyDrafts() {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }
  const organizations = (await getMyOrganizations()).filter(
    (org) => org.status === "active",
  );
  const pages = await Promise.all(
    organizations.map((org) =>
      backendFetch<PostPageApi>(`${orgPath(org.slug)}/post-drafts?limit=50`, {
        method: "GET",
        token,
      }),
    ),
  );
  return pages
    .flatMap((page) => (page.ok ? page.data.items : []))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((post) => toPost(post, formatDateTime));
}
