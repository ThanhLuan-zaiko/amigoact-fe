import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheckCircle, FiMapPin, FiUsers } from "react-icons/fi";
import { Avatar } from "../../core/components/Avatar.tsx";
import type { PublicOrg } from "../api.ts";
import { orgMediaUrl } from "../api.ts";
import { JOIN_POLICY_LABELS } from "../messages.tsx";
import { mosaicItems, orgLocation } from "../utils.ts";
import { KindPill } from "./KindPill.tsx";
import { OrgMediaViewer } from "./MediaViewers.tsx";
import { OrgFeedRow } from "./OrgFeedRow.tsx";
import { OrgLogo } from "./OrgLogo.tsx";
import { OrgMediaMosaic } from "./OrgMediaMosaic.tsx";

// One public-directory row: owner avatar + org identity, media mosaic
// that opens the lightbox without navigating away from the feed.
export function DirectoryRow({ org }: { org: PublicOrg }): ReactElement {
  const [viewer, setViewer] = useState<number | null>(null);
  const location = orgLocation(org);
  const hasOwner = org.owner_name !== null;
  const avatar = !hasOwner ? (
    <OrgLogo org={org} className="h-10 w-10 shrink-0" />
  ) : org.owner_avatar_url !== null ? (
    <img
      src={orgMediaUrl(org.owner_avatar_url)}
      alt=""
      loading="lazy"
      className="h-10 w-10 shrink-0 rounded-full border border-zinc-200 bg-white object-cover dark:border-zinc-800 dark:bg-zinc-900"
    />
  ) : (
    <Avatar name={org.owner_name ?? org.name} />
  );
  const isVerified = org.verified_at !== null;
  const verified = (
    <FiCheckCircle
      className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
      role="img"
      aria-label="Đã xác minh"
    />
  );
  return (
    <>
      <OrgFeedRow
        avatar={avatar}
        title={hasOwner ? org.owner_name : org.name}
        badge={hasOwner ? undefined : isVerified ? verified : undefined}
        meta={
          hasOwner ? (
            <>
              {`sở hữu ${org.name}`}
              {isVerified && <>{" "}{verified}</>}
            </>
          ) : (
            `@${org.slug}`
          )
        }
        href={`/orgs/${org.slug}`}
        footer={
          <>
            <KindPill kind={org.kind} />
            <span className="flex items-center gap-1">
              <FiUsers className="h-3.5 w-3.5" aria-hidden="true" />
              {`${org.member_count} thành viên`}
            </span>
            {location !== null && (
              <span className="flex items-center gap-1">
                <FiMapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {location}
              </span>
            )}
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs dark:border-zinc-800">
              {JOIN_POLICY_LABELS[org.join_policy] ?? org.join_policy}
            </span>
          </>
        }
      >
        {org.description !== "" && (
          <p className="mt-0.5 line-clamp-2 text-[15px] text-zinc-600 dark:text-zinc-400">
            {org.description}
          </p>
        )}
        <OrgMediaMosaic org={org} onOpen={setViewer} />
      </OrgFeedRow>
      {viewer !== null && (
        <OrgMediaViewer
          slug={org.slug}
          fallback={mosaicItems(org)}
          index={viewer}
          title={org.name}
          onClose={() => setViewer(null)}
          onIndex={setViewer}
        />
      )}
    </>
  );
}
