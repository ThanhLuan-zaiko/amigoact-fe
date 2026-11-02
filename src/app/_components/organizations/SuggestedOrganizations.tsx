import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import { getMyOrganizations, listOrganizations } from "@/lib/organizationApi";
import { JOIN_POLICY_LABELS } from "@/lib/organizations";
import IconStat from "../IconStat";
import { mutedText, tagChip } from "../ui";

const SUGGESTION_COUNT = 5;
// Fetch more than are shown, because the viewer's own organizations are left out.
const FETCH_COUNT = 20;

// Reads the session, so the home page renders it behind a Suspense boundary.
export default async function SuggestedOrganizations() {
  const [page, mine] = await Promise.all([
    listOrganizations("", 0, FETCH_COUNT),
    getMyOrganizations(),
  ]);
  const joined = new Set(mine.map((organization) => organization.id));
  const suggestions = (page?.items ?? [])
    .filter((organization) => !joined.has(organization.id))
    .slice(0, SUGGESTION_COUNT);

  if (suggestions.length === 0) {
    return <p className={mutedText}>Chưa có gợi ý.</p>;
  }
  return (
    <ul className="flex flex-col gap-3">
      {suggestions.map((organization) => (
        <li key={organization.id} className="flex min-w-0 flex-col gap-1">
          <Link
            href={`/organizations/${organization.slug}`}
            className="block truncate font-semibold transition-colors hover:text-teal-700 dark:hover:text-teal-400"
          >
            {organization.name}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <span className={tagChip}>
              {JOIN_POLICY_LABELS[organization.join_policy]}
            </span>
            <IconStat icon={FiUsers} label="Thành viên">
              {organization.member_count}
            </IconStat>
          </div>
        </li>
      ))}
    </ul>
  );
}
