import Link from "next/link";
import { getMyOrganizations } from "@/lib/organizationApi";
import { orgBase } from "@/lib/orgRoutes";

// Reads the session, so the app layout renders it behind a Suspense boundary.
export default async function JoinedOrganizations() {
  const organizations = (await getMyOrganizations()).filter(
    (organization) => organization.status === "active",
  );
  if (organizations.length === 0) {
    return (
      <p className="px-3 pt-1 text-sm text-slate-500 dark:text-slate-400">
        Chưa tham gia tổ chức nào.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {organizations.map((organization) => (
        <li key={organization.id}>
          <Link
            href={orgBase(organization.slug, organization.role === "owner")}
            className="block truncate rounded-md px-3 py-2 text-sm text-slate-700 transition-colors hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400"
          >
            {organization.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
