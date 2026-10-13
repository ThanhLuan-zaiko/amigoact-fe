import type { ReactElement } from "react";
import { FiCalendar, FiStar, FiTag } from "react-icons/fi";
import { LoadingState } from "../../core/components/Feedback.tsx";
import { useDiscovery } from "../hooks.ts";
import type { ActivitySummary } from "../api.ts";
import { ActivityCard } from "./ActivityCard.tsx";

function Shelf({
  title,
  icon,
  items,
}: {
  title: string;
  icon: ReactElement;
  items: ActivitySummary[];
}): ReactElement | null {
  if (items.length === 0) return null;
  return (
    <section aria-label={title}>
      <h2 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {icon}
        {title}
      </h2>
      <ul className="mt-2 grid grid-cols-1 items-start gap-2 sm:grid-cols-2 @4xl:grid-cols-3">
        {items.map((a) => (
          <li key={a.id}>
            <ActivityCard
              activity={a}
              href={`/events/${a.org_id}/${a.slug}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DiscoverySections(): ReactElement | null {
  const discovery = useDiscovery();
  if (discovery.isPending) {
    return <LoadingState label="Đang tải gợi ý…" />;
  }
  const data = discovery.data;
  if (!data) return null;
  const featured = data.featured.slice(0, 6);
  const upcoming = data.upcoming.slice(0, 6);
  const shelves = data.categories.filter((c) => c.items.length > 0);
  if (featured.length === 0 && upcoming.length === 0 && shelves.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-4">
      <Shelf
        title="Nổi bật"
        icon={<FiStar className="h-4 w-4 text-brand" aria-hidden="true" />}
        items={featured}
      />
      <Shelf
        title="Sắp diễn ra"
        icon={
          <FiCalendar className="h-4 w-4 text-brand" aria-hidden="true" />
        }
        items={upcoming}
      />
      {shelves.map((bucket) => (
        <Shelf
          key={bucket.category_id}
          title={bucket.name}
          icon={<FiTag className="h-4 w-4 text-brand" aria-hidden="true" />}
          items={bucket.items}
        />
      ))}
    </div>
  );
}
