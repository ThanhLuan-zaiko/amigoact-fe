import { useState, type ReactElement } from "react";
import { FiCompass, FiFilter } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useActivityFeed, useCategories } from "./hooks.ts";
import { ActivityCard } from "./components/ActivityCard.tsx";
import { DiscoverySections } from "./components/DiscoverySections.tsx";

export function EventsPage(): ReactElement {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const feed = useActivityFeed("published", categoryId);
  const categories = useCategories();

  return (
    <>
      <Section>
        <div data-rise className="flex items-center gap-2">
          <FiCompass
            className="h-5 w-5 text-zinc-900 dark:text-brand"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Khám phá hoạt động
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Các hoạt động tình nguyện đang mở đăng ký từ cộng đồng.
        </p>
        <div
          role="group"
          aria-label="Lọc theo danh mục"
          className="mt-3 flex flex-wrap gap-2"
        >
          <Button
            variant={categoryId === undefined ? "primary" : "secondary"}
            onClick={() => setCategoryId(undefined)}
            icon={<FiFilter className="h-4 w-4" aria-hidden="true" />}
          >
            Tất cả
          </Button>
          {(categories.data ?? []).map((c) => (
            <Button
              key={c.id}
              variant={categoryId === c.id ? "primary" : "secondary"}
              onClick={() => setCategoryId(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>
      </Section>
      {categoryId === undefined && (
        <Section>
          <DiscoverySections />
        </Section>
      )}
      <Section>
        {feed.isPending && <LoadingState label="Đang tải hoạt động…" />}
        {feed.isError && (
          <ErrorState
            title="Không tải được"
            message={feed.error.message}
          />
        )}
        {feed.isSuccess && feed.data.length === 0 && (
          <EmptyState
            title="Chưa có hoạt động"
            message="Chưa có hoạt động nào được công bố trong danh mục này."
          />
        )}
        <ul className="flex flex-col gap-2">
          {(feed.data ?? []).map((a) => (
            <li key={a.id}>
              <ActivityCard
                activity={a}
                href={`/events/${a.org_id}/${a.slug}`}
              />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
