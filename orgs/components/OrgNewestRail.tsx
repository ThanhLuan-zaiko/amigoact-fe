import type { ReactElement } from "react";
import { FiChevronRight, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import type { PublicOrg } from "../api.ts";
import { orgLocation } from "../utils.ts";
import { OrgLogo } from "./OrgLogo.tsx";

interface OrgNewestRailProps {
  items: PublicOrg[];
}

export function OrgNewestRail({ items }: OrgNewestRailProps): ReactElement {
  return (
    <BentoCard className="md:col-span-6 lg:col-span-4">
      <div data-rise className="flex items-center gap-2">
        <FiClock
          className="h-5 w-5 text-zinc-900 dark:text-brand"
          aria-hidden="true"
        />
        <h2 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Vừa tham gia
        </h2>
      </div>
      <ul className="mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((org) => (
          <li key={org.id}>
            <Link
              to={`/orgs/${org.slug}`}
              className="group flex items-center gap-3 rounded-lg px-1 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand"
            >
              <OrgLogo
                org={org}
                className="h-9 w-9 shrink-0"
                iconClassName="h-4 w-4"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-zinc-900 group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-brand">
                  {org.name}
                </span>
                <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                  {`${orgLocation(org) ?? `@${org.slug}`} · ${org.member_count} thành viên`}
                </span>
              </span>
              <FiChevronRight
                className="ml-auto h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </BentoCard>
  );
}
