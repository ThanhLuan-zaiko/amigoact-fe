import type { ReactElement } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiImage,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import { orgMediaUrl, type PublicOrg } from "../api.ts";
import { JOIN_POLICY_LABELS } from "../messages.tsx";
import { orgLocation } from "../utils.ts";
import { KindPill } from "./KindPill.tsx";
import { OrgLogo } from "./OrgLogo.tsx";

interface OrgSpotlightCardProps {
  org: PublicOrg;
}

export function OrgSpotlightCard({ org }: OrgSpotlightCardProps): ReactElement {
  const location = orgLocation(org);
  return (
    <Section className="relative transition-colors hover:border-brand/40 dark:hover:border-brand/30 ">
      <div data-rise>
        {org.cover_url ? (
          <img
            src={orgMediaUrl(org.cover_url)}
            alt=""
            loading="lazy"
            className="h-36 w-full rounded-xl object-cover sm:h-44"
          />
        ) : (
          <div className="flex h-28 w-full items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-zinc-400 dark:border-brand/30 dark:text-zinc-500">
            <FiImage className="h-6 w-6" aria-hidden="true" />
          </div>
        )}
        <div className="px-1">
          <span className="-mt-8 block w-fit rounded-full bg-white p-1 dark:bg-zinc-950">
            <OrgLogo org={org} className="h-14 w-14" iconClassName="h-6 w-6" />
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              {org.name}
            </h2>
            {org.verified_at !== null && (
              <FiCheckCircle
                className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                role="img"
                aria-label="Đã xác minh"
              />
            )}
            <KindPill kind={org.kind} />
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            @{org.slug}
          </p>
          {org.description && (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {org.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
            {location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="h-4 w-4" aria-hidden="true" />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiUsers className="h-4 w-4" aria-hidden="true" />
              {`${org.member_count} thành viên`}
            </span>
            <span className="rounded-full border border-zinc-200 px-2 py-0.5 dark:border-zinc-800">
              {JOIN_POLICY_LABELS[org.join_policy] ?? org.join_policy}
            </span>
          </div>
          <div className="mt-4">
            <Button
              to={`/orgs/${org.slug}`}
              variant="primary"
              icon={<FiArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Xem chi tiết
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
