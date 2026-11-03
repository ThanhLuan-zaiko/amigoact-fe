import Link from "next/link";
import { FiSettings, FiUsers } from "react-icons/fi";
import {
  initials,
  JOIN_POLICY_LABELS,
  type MyOrganization,
  ORG_TYPE_LABELS,
} from "@/lib/organizations";
import IconStat from "../IconStat";
import { mutedText, panel, secondaryButton } from "../ui";

// The cover is a banner at the top. Without one, the logo or the initials lead the card.
export default function OwnedOrganizationCard({
  organization,
}: {
  organization: MyOrganization;
}) {
  const href = `/organizations/${organization.slug}`;
  return (
    <div className={`${panel} flex min-w-0 flex-col overflow-hidden`}>
      {organization.cover_url ? (
        // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
        <img
          src={organization.cover_url}
          alt=""
          className="h-24 w-full object-cover sm:h-28"
        />
      ) : null}
      <div className="flex min-w-0 flex-col gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {organization.logo_url ? (
            // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
            <img
              src={organization.logo_url}
              alt=""
              className="h-10 w-10 shrink-0 rounded-md border border-slate-300 object-cover dark:border-slate-700"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
              {initials(organization.name)}
            </div>
          )}
          <Link
            href={href}
            className="min-w-0 truncate font-semibold transition-colors hover:text-teal-700 dark:hover:text-teal-400"
          >
            {organization.name}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={mutedText}>
            {ORG_TYPE_LABELS[organization.org_type]} ·{" "}
            {JOIN_POLICY_LABELS[organization.join_policy]}
          </span>
          <IconStat icon={FiUsers} label="Thành viên">
            {organization.member_count}
          </IconStat>
        </div>
        <Link href={`${href}/settings`} className={`${secondaryButton} w-full`}>
          <FiSettings aria-hidden="true" />
          Quản lý
        </Link>
      </div>
    </div>
  );
}
