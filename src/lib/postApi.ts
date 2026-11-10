import "server-only";
import { formatDateTime } from "./activities";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import { getMyOrganizations } from "./organizationApi";
import { type PostPageApi, toPost } from "./posts";

// The signed-in user's drafts in every organization they are an active member of.
// Read it behind a Suspense boundary. A failed organization is skipped, so one
// broken request does not hide the other drafts.
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
      backendFetch<PostPageApi>(
        `/organizations/${encodeURIComponent(org.slug)}/post-drafts?limit=50`,
        { method: "GET", token },
      ),
    ),
  );
  return pages
    .flatMap((page) => (page.ok ? page.data.items : []))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((post) => toPost(post, formatDateTime));
}
