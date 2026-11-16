import Link from "next/link";
import { FiUsers } from "react-icons/fi";
import { focusClass } from "@/lib/focus";
import {
  initials,
  JOIN_POLICY_LABELS,
  ORG_TYPE_LABELS,
  type OrganizationSummary,
} from "@/lib/organizations";
import { sizedSrc, srcSetFor } from "@/lib/pictureSizes";
import IconStat from "../IconStat";
import { mutedText, panel, tagChip } from "../ui";

type OrganizationCardProps = {
  organization: OrganizationSummary;
  // Replaces the join policy, for example with the viewer's role.
  badge?: string;
};

// The cover is a banner above the text. Without one, the logo or the initials lead.
// On the public directory a strip of pictures from the newest public posts follows.
export default function OrganizationCard({
  organization,
  badge,
}: OrganizationCardProps) {
  const postPictures = organization.post_pictures ?? [];
  return (
    <Link
      href={`/org/${organization.slug}`}
      className={`${panel} flex min-w-0 flex-col overflow-hidden transition-colors hover:border-teal-700 dark:hover:border-teal-400`}
    >
      {organization.cover_url ? (
        // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
        <img
          src={sizedSrc(organization.cover_url, 640)}
          srcSet={srcSetFor(organization.cover_url)}
          sizes="(min-width: 768px) 720px, 100vw"
          alt=""
          className={`h-24 w-full object-cover sm:h-36 ${focusClass(organization.cover_focus)}`}
        />
      ) : null}
      <div className="flex min-w-0 gap-3 p-4">
        {organization.logo_url ? (
          // biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path.
          <img
            src={sizedSrc(organization.logo_url, 320)}
            alt=""
            className={`h-11 w-11 shrink-0 rounded-md border border-slate-300 object-cover dark:border-slate-700 ${focusClass(organization.logo_focus)}`}
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-slate-200 text-sm font-bold text-slate-700 dark:border-slate-800 dark:text-slate-300">
            {initials(organization.name)}
          </div>
        )}
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
      </div>
      {postPictures.length > 0 ? (
        <ul
          aria-label="Ảnh từ bài viết"
          className="grid grid-cols-4 gap-1 px-4 pb-4"
        >
          {postPictures.map((picture) => (
            <li key={picture.url}>
              {/* biome-ignore lint/performance/noImgElement: the picture is a same-origin proxy path. */}
              <img
                src={sizedSrc(picture.url, 320)}
                alt=""
                loading="lazy"
                className={`aspect-square w-full rounded-md object-cover ${focusClass(picture.focus)}`}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </Link>
  );
}
