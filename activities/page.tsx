import { useState, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
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
import { TagFilter } from "./components/TagFilter.tsx";

export function EventsPage(): ReactElement {
  const [categoryId, setCategoryId] = useState<string | undefined>();
  // The hashtag filter is deep-linkable (?tag=slug) so tag chips on
  // cards and detail pages route here directly.
  const [searchParams, setSearchParams] = useSearchParams();
  const tagSlug = searchParams.get("tag") ?? undefined;
  const [tagName, setTagName] = useState<string | undefined>();
  const feed = useActivityFeed("published", categoryId, tagSlug);
  const categories = useCategories();

  const setTag = (slug: string | undefined, name?: string): void => {
    setTagName(name);
    setSearchParams(
      (params) => {
        if (slug) params.set("tag", slug);
        else params.delete("tag");
        return params;
      },
      { replace: true },
    );
  };

  return (
    <>
      <Section>
        <div className="flex items-center gap-2">
          <FiCompass
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
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
          className="mt-3 flex flex-wrap items-center gap-2"
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
        <div className="mt-2 flex items-center gap-2">
          <TagFilter slug={tagSlug} name={tagName} onChange={setTag} />
          {tagSlug !== undefined && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Đang lọc theo thẻ
            </span>
          )}
        </div>
      </Section>
      {categoryId === undefined && tagSlug === undefined && (
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
            message="Chưa có hoạt động nào được công bố phù hợp bộ lọc này."
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
