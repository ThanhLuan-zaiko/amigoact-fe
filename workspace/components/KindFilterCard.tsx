import type { ReactElement } from "react";
import { FiFilter } from "react-icons/fi";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import type { PostKind } from "../board-api.ts";
import { POST_KIND_LABELS } from "../messages.tsx";

interface KindFilterCardProps {
  kind: PostKind | undefined;
  onKind: (kind: PostKind | undefined) => void;
}

const FILTERS: { value: PostKind | undefined; label: string }[] = [
  { value: undefined, label: "Tất cả" },
  { value: "discussion", label: POST_KIND_LABELS["discussion"] },
  { value: "announcement", label: POST_KIND_LABELS["announcement"] },
];

// Kind filter rendered as one tile inside the published feed so the
// chips share the same rhythm as the article cards around them.
export function KindFilterCard({
  kind,
  onKind,
}: KindFilterCardProps): ReactElement {
  return (
    <Section>
      <div className="flex items-center gap-2">
        <FiFilter
          className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
          aria-hidden="true"
        />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Lọc bài viết
        </h3>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Chọn loại nội dung hiển thị trên bảng tin.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value ?? "all"}
            type="button"
            variant={kind === filter.value ? "primary" : "secondary"}
            onClick={() => onKind(filter.value)}
            aria-pressed={kind === filter.value}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </Section>
  );
}
