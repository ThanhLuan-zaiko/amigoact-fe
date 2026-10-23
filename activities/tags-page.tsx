import { useEffect, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiHash } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { foldTag } from "./tag-utils.ts";
import { toVietnameseTagMessage } from "./messages.tsx";
import { TagCreateForm } from "./components/TagCreateForm.tsx";
import { UserTagRow } from "./components/UserTagRow.tsx";
import {
  followTagParam,
  selectMyTag,
  useMyTags,
  useShownTag,
} from "./tags-hooks.ts";

// Personal tag book. A tag is a name until a board post picks it up.
export function ManageTagsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const needle = foldTag(searchParams.get("q") ?? "");
  const param = searchParams.get("tag") ?? "";
  const selected = useShownTag(param);
  const tags = useMyTags();
  useEffect(() => {
    followTagParam(param);
  }, [param]);
  const items = (tags.data ?? []).filter(
    (tag) =>
      !needle ||
      foldTag(tag.name).includes(needle) ||
      tag.slug.includes(needle),
  );

  function select(slug: string): void {
    selectMyTag(slug);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tag", slug);
        return next;
      },
      { replace: true },
    );
  }

  return (
    <>
      <Section>
        <div className="flex items-center gap-2">
          <FiHash
            className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
            aria-hidden="true"
          />
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Thẻ
          </h1>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Thẻ là của bạn, không thuộc tổ chức nào. Tạo một cái tên ở đây,
          rồi khi viết bài thì chọn thẻ đó để gắn vào bài.
        </p>
        <TagCreateForm />
      </Section>
      <Section>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {`${items.length} thẻ`}
        </p>
        {tags.isPending && <LoadingState label="Đang tải thẻ…" />}
        {tags.isError && (
          <ErrorState
            title="Không tải được"
            message={toVietnameseTagMessage(tags.error.code)}
          />
        )}
        {tags.isSuccess && items.length === 0 && !needle && (
          <EmptyState
            title="Chưa có thẻ"
            message="Tạo thẻ ở trên. Khi viết bài, chọn thẻ đó để gắn."
          />
        )}
        {tags.isSuccess && items.length === 0 && needle && (
          <EmptyState
            title="Không có thẻ phù hợp."
            message="Thử từ khóa khác."
          />
        )}
        {tags.isSuccess && items.length > 0 && (
          <ul className="-mx-4 divide-y divide-zinc-200 dark:divide-zinc-800">
            {items.map((tag) => (
              <UserTagRow
                key={tag.slug}
                tag={tag}
                selected={tag.slug === selected}
                onSelect={select}
              />
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}
