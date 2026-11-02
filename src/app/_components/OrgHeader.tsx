import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import {
  initials,
  JOIN_POLICY_LABELS,
  ORG_TYPE_LABELS,
  type OrganizationDetail,
  ROLE_LABELS,
} from "@/lib/organizations";
import IconStat from "./IconStat";
import MembershipAction from "./organizations/MembershipAction";
import OrgNav from "./organizations/OrgNav";
import { panel, tagChip } from "./ui";

type OrgHeaderProps = {
  organization: OrganizationDetail;
};

export default function OrgHeader({ organization }: OrgHeaderProps) {
  const { viewer } = organization;

  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-slate-300 text-xl font-extrabold text-slate-900 dark:border-slate-700 dark:text-slate-100">
          {initials(organization.name)}
        </div>

        <div className="flex min-w-0 flex-1 basis-56 flex-col gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight break-words">
            {organization.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className={tagChip}>
              {ORG_TYPE_LABELS[organization.org_type]}
            </span>
            <span className={tagChip}>
              {JOIN_POLICY_LABELS[organization.join_policy]}
            </span>
            {viewer.role ? (
              <span className="inline-flex items-center rounded-sm border border-teal-700 px-2 py-1 text-xs font-medium text-teal-700 dark:border-teal-400 dark:text-teal-400">
                {ROLE_LABELS[viewer.role]}
              </span>
            ) : null}
            <IconStat icon={FiUsers} label="Thành viên">
              {organization.member_count}
            </IconStat>
            <IconStat icon={FiCalendar} label="Hoạt động">
              {organization.activity_count}
            </IconStat>
            <IconStat icon={FiClock} label="Giờ tình nguyện">
              {organization.volunteer_hours}h
            </IconStat>
          </div>
        </div>

        <MembershipAction key={viewer.status} organization={organization} />
      </div>

      <OrgNav slug={organization.slug} viewer={viewer} />
    </section>
  );
}
