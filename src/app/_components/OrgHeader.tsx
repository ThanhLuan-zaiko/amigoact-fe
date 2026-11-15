import { FiCalendar, FiClock, FiUsers } from "react-icons/fi";
import { focusClass } from "@/lib/focus";
import {
  initials,
  JOIN_POLICY_LABELS,
  LEGAL_STATUS_LABELS,
  type LegalStatus,
  ORG_TYPE_LABELS,
  type OrganizationDetail,
  ROLE_LABELS,
} from "@/lib/organizations";
import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";
import IconStat from "./IconStat";
import MembershipAction from "./organizations/MembershipAction";
import OrgNav from "./organizations/OrgNav";
import { panel, tagChip } from "./ui";

type OrgHeaderProps = {
  organization: OrganizationDetail;
};

// Only "verified" carries the semantic green. The other statuses stay neutral.
const LEGAL_BADGE: Record<LegalStatus, string> = {
  verified:
    "inline-flex items-center rounded-sm bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400",
  pending: tagChip,
  none: tagChip,
};

export default function OrgHeader({ organization }: OrgHeaderProps) {
  const { viewer } = organization;

  return (
    <section className={`${panel} flex flex-col gap-4 p-4 sm:p-6`}>
      {organization.cover_url ? (
        // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
        <img
          src={sizedSrc(organization.cover_url, 1080)}
          srcSet={srcSetFor(organization.cover_url)}
          sizes="(min-width: 1280px) 1100px, 100vw"
          alt=""
          className={`aspect-[2/1] w-full rounded-lg bg-slate-100 object-cover sm:aspect-[3/1] xl:aspect-[4/1] dark:bg-slate-900 ${focusClass(organization.cover_focus)}`}
        />
      ) : null}
      <div className="flex flex-wrap items-start gap-4">
        {organization.logo_url ? (
          // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
          <img
            src={sizedSrc(organization.logo_url, 320)}
            alt=""
            className={`h-20 w-20 shrink-0 rounded-lg border border-slate-300 object-cover dark:border-slate-700 ${focusClass(organization.logo_focus)}`}
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-xl font-extrabold text-slate-900 dark:border-slate-700 dark:text-slate-100">
            {initials(organization.name)}
          </div>
        )}

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
            <span className={LEGAL_BADGE[organization.legal_status]}>
              {LEGAL_STATUS_LABELS[organization.legal_status]}
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
