import type { ReactElement } from "react";
import { Section } from "../../core/components/Section.tsx";
import type { MyActivityItem, MyActivityOrg } from "../feed-api.ts";
import { ActivityFeedRow } from "./ActivityFeedRow.tsx";

export interface FeedSection {
  title: string;
  items: MyActivityItem[];
}

// Time sections of the cross-org feed, one hairline-separated surface each.
// Empty sections are dropped by the caller.
export function ActivityFeed({
  sections,
  orgs,
}: {
  sections: FeedSection[];
  orgs: MyActivityOrg[];
}): ReactElement {
  const byId = new Map(orgs.map((org) => [org.id, org] as const));
  return (
    <>
      {sections.map((section) => (
        <Section key={section.title}>
          <h2 className="flex items-baseline gap-2 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            {section.title}
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {section.items.length}
            </span>
          </h2>
          <ul className="-mx-4 mt-2 flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
            {section.items.map((item) => (
              <ActivityFeedRow
                key={item.id}
                item={item}
                org={byId.get(item.org_id)}
              />
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}
