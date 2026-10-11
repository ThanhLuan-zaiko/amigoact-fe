import type { ReactElement } from "react";
import { FiCheckCircle, FiImage, FiMapPin, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { orgMediaUrl, type PublicOrg } from "../api.ts";
import { JOIN_POLICY_LABELS } from "../messages.tsx";
import { orgLocation } from "../utils.ts";
import { KindPill } from "./KindPill.tsx";
import { OrgLogo } from "./OrgLogo.tsx";

interface OrgCardProps {
  org: PublicOrg;
}

export function OrgCard({ org }: OrgCardProps): ReactElement {
  const location = orgLocation(org);
  return (
    <BentoCard className="relative transition-colors hover:border-brand/40 dark:hover:border-brand/30 md:col-span-3 lg:col-span-4">
      <div data-rise className="flex h-full flex-col">
        {org.cover_url ? (
          <img
            src={orgMediaUrl(org.cover_url)}
            alt=""
            loading="lazy"
            className="h-24 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-24 w-full items-center justify-center rounded-xl border border-brand/40 bg-brand/10 text-zinc-400 dark:border-brand/30 dark:text-zinc-500">
            <FiImage className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <span className="-mt-6 block w-fit rounded-full bg-white p-0.5 dark:bg-zinc-950">
          <OrgLogo org={org} className="h-11 w-11" iconClassName="h-5 w-5" />
        </span>
        <div className="mt-2 flex items-center gap-1.5">
          <h3 className="truncate text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
            {org.name}
          </h3>
          {org.verified_at !== null && (
            <FiCheckCircle
              className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
              role="img"
              aria-label="Đã xác minh"
            />
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <KindPill kind={org.kind} />
          {org.join_policy === "open" && (
            <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-brand/30 dark:text-brand">
              {JOIN_POLICY_LABELS[org.join_policy]}
            </span>
          )}
        </div>
        {org.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {org.description}
          </p>
        )}
        <p className="mt-auto flex flex-wrap items-center gap-3 pt-3 text-xs text-zinc-500 dark:text-zinc-400">
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
        </p>
      </div>
      <Link
        to={`/orgs/${org.slug}`}
        aria-label={org.name}
        className="absolute inset-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand"
      />
    </BentoCard>
  );
}
