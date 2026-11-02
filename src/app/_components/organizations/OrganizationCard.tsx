import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import {
  initials,
  JOIN_POLICY_LABELS,
  ORG_TYPE_LABELS,
  type OrganizationSummary,
} from "@/lib/organizations";
import IconStat from "../IconStat";
import { mutedText, panel, tagChip } from "../ui";

type OrganizationCardProps = {
  organization: OrganizationSummary;
  // Replaces the join policy, for example with the viewer's role.
  badge?: string;
};

export default function OrganizationCard({
  organization,
  badge,
}: OrganizationCardProps) {
  return (
    <Link
      href={`/organizations/${organization.slug}`}
      className={`${panel} flex min-w-0 gap-3 p-4 transition-colors hover:border-teal-700 dark:hover:border-teal-400`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
        {initials(organization.name)}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-semibold">{organization.name}</p>
        {organization.description ? (
          <p className={`${mutedText} line-clamp-2`}>
            {organization.description}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <span className={tagChip}>
            {ORG_TYPE_LABELS[organization.org_type]}
          </span>
          <span className={tagChip}>
            {badge ?? JOIN_POLICY_LABELS[organization.join_policy]}
          </span>
          <IconStat icon={FiUsers} label="Thành viên">
            {organization.member_count}
          </IconStat>
        </div>
      </div>
    </Link>
  );
}
