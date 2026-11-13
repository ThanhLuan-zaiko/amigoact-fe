import "server-only";
import { getAccessToken } from "./auth";
import { backendFetch } from "./backend";
import type {
  ApplicationPage,
  DeletedOrganization,
  GalleryItem,
  MemberPage,
  MyOrganization,
  OrganizationDetail,
  OrganizationPage,
} from "./organizations";
import { PAGE_SIZE } from "./pagination";
import type { RoleList } from "./roles";

function organizationPath(slug: string): string {
  return `/organizations/${encodeURIComponent(slug)}`;
}

// Read these behind a Suspense boundary. React memoizes an identical GET across
// the components of one render, so the layout and the page make one request.
export async function getOrganization(
  slug: string,
): Promise<OrganizationDetail | null> {
  const result = await backendFetch<OrganizationDetail>(
    organizationPath(slug),
    {
      method: "GET",
      token: await getAccessToken(),
    },
  );
  if (result.ok) {
    return result.data;
  }
  if (result.status === 404 || result.status === 422) {
    return null;
  }
  throw new Error(`Could not load the organization: ${result.code}`);
}

export async function listOrganizations(
  search: string,
  offset: number,
  limit = PAGE_SIZE,
): Promise<OrganizationPage | null> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (search) {
    query.set("q", search);
  }
  const result = await backendFetch<OrganizationPage>(
    `/organizations?${query}`,
    { method: "GET" },
  );
  return result.ok ? result.data : null;
}

// The directory without the viewer's own organizations. The backend filters them,
// so every page stays full.
export async function listOtherOrganizations(
  search: string,
  offset: number,
): Promise<OrganizationPage | null> {
  const query = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
    exclude_owned: "true",
  });
  if (search) {
    query.set("q", search);
  }
  const token = await getAccessToken();
  const result = await backendFetch<OrganizationPage>(
    `/organizations?${query}`,
    token ? { method: "GET", token } : { method: "GET" },
  );
  return result.ok ? result.data : null;
}

export async function getGallery(slug: string): Promise<GalleryItem[]> {
  const result = await backendFetch<GalleryItem[]>(
    `${organizationPath(slug)}/gallery`,
    { method: "GET" },
  );
  return result.ok ? result.data : [];
}

export async function getMyOrganizations(): Promise<MyOrganization[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }
  const result = await backendFetch<MyOrganization[]>("/organizations/mine", {
    method: "GET",
    token,
  });
  return result.ok ? result.data : [];
}

// The owner's trash. Visitors get an empty list, because the backend needs a login.
export async function getDeletedOrganizations(): Promise<
  DeletedOrganization[]
> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }
  const result = await backendFetch<DeletedOrganization[]>(
    "/organizations/mine/deleted",
    { method: "GET", token },
  );
  return result.ok ? result.data : [];
}

export async function getMembers(
  slug: string,
  offset: number,
): Promise<MemberPage | null> {
  const result = await backendFetch<MemberPage>(
    `${organizationPath(slug)}/members?limit=${PAGE_SIZE}&offset=${offset}`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? result.data : null;
}

export async function getApplications(
  slug: string,
  offset: number,
): Promise<ApplicationPage | null> {
  const result = await backendFetch<ApplicationPage>(
    `${organizationPath(slug)}/applications?limit=${PAGE_SIZE}&offset=${offset}`,
    { method: "GET", token: await getAccessToken() },
  );
  return result.ok ? result.data : null;
}

export async function getRoles(slug: string): Promise<RoleList | null> {
  const result = await backendFetch<RoleList>(
    `${organizationPath(slug)}/roles`,
    {
      method: "GET",
      token: await getAccessToken(),
    },
  );
  return result.ok ? result.data : null;
}
