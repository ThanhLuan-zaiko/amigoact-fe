import type { ReactElement } from "react";
import { useState } from "react";
import { FiCheck, FiImage, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, LoadingState } from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import { formatDateTime } from "../../activities/dates.tsx";
import type { ModerationItem } from "../api.ts";
import { useModerationQueue, useReviewModeration } from "../hooks.ts";

function Row({
  item,
  onReview,
  busy,
}: {
  item: ModerationItem;
  onReview: (item: ModerationItem, approve: boolean) => void;
  busy: boolean;
}): ReactElement {
  return (
    <li className="flex items-center gap-3 px-1 py-3">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {item.file_url ? (
          <img
            src={item.file_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <FiImage className="h-6 w-6 text-zinc-400" aria-hidden />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.asset_id}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tải lên {formatDateTime(item.created_at)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          aria-label="Duyệt media"
          icon={<FiCheck className="h-4 w-4" aria-hidden />}
          onClick={() => onReview(item, true)}
        >
          Duyệt
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          aria-label="Từ chối media"
          icon={<FiX className="h-4 w-4" aria-hidden />}
          onClick={() => onReview(item, false)}
        >
          Từ chối
        </Button>
      </div>
    </li>
  );
}

const TABS = ["pending", "approved", "rejected"] as const;
const TAB_LABELS: Record<(typeof TABS)[number], string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
};

export function ModerationCard(): ReactElement {
  const [status, setStatus] = useState<(typeof TABS)[number]>("pending");
  const queue = useModerationQueue(status);
  const review = useReviewModeration();

  function act(item: ModerationItem, approve: boolean): void {
    review.mutate({ item, approve });
  }

  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Kiểm duyệt media
        </h3>
        <div className="flex gap-1" role="tablist" aria-label="Trạng thái">
          {TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={status === tab}
              onClick={() => setStatus(tab)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 ${
                status === tab
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>
      {queue.isPending ? (
        <LoadingState label="Đang tải hàng chờ" />
      ) : (queue.data ?? []).length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Hàng chờ trống"
            message="Không có media nào ở trạng thái này."
          />
        </div>
      ) : (
        <ul className="mt-1 divide-y divide-zinc-200 dark:divide-zinc-800">
          {queue.data!.map((item) => (
            <Row
              key={item.moderation_id}
              item={item}
              busy={review.isPending}
              onReview={act}
            />
          ))}
        </ul>
      )}
    </Section>
  );
}
