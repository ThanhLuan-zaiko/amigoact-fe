import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { FiCornerDownRight, FiPlus } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { useRoomThreads } from "../channel-hooks.ts";
import {
  channelMetaLabel,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";

const SECTION_TITLE =
  "flex items-center gap-2 text-xs font-semibold uppercase " +
  "tracking-wide text-zinc-500 dark:text-zinc-400";

interface ChatThreadsSectionProps {
  open: boolean;
  orgId: string;
  roomId: string;
  // Close the info modal when a thread row navigates into its room.
  onClose: () => void;
  // Open the create form; the dialog itself is a sibling of the info
  // modal (nested portal children count as outside presses on it).
  onCompose: () => void;
}

// Sub-thread list inside the room info modal: focused channels the
// room's members opened for one event/goal. Rows are plain links to
// the thread's own room (channel_id doubles as room_id).
export function ChatThreadsSection({
  open,
  orgId,
  roomId,
  onClose,
  onCompose,
}: ChatThreadsSectionProps): ReactElement {
  const threads = useRoomThreads(open ? orgId : null, roomId);
  const items = threads.data?.items ?? [];

  return (
    <section>
      <h3 className={SECTION_TITLE}>
        <FiCornerDownRight className="h-4 w-4" aria-hidden="true" />
        Luồng tập trung
      </h3>
      <div className="mt-2 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {threads.isPending && (
          <LoadingState label="Đang tải luồng…" />
        )}
        {threads.isError && (
          <ErrorState
            title="Không tải được luồng"
            message={toVietnameseWorkspaceMessage(
              threads.error instanceof ApiError
                ? threads.error.code
                : "REQUEST_FAILED",
            )}
          />
        )}
        {threads.data !== undefined && items.length === 0 && (
          <EmptyState
            title="Chưa có luồng nào"
            message="Tạo luồng để bàn riêng về một sự kiện hay mục tiêu."
          />
        )}
        {items.map((thread) => (
          <Link
            key={thread.channel_id}
            to={`?room=${encodeURIComponent(thread.channel_id)}`}
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              aria-hidden="true"
            >
              <FiCornerDownRight className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {thread.name}
              </span>
              <span className="block truncate text-xs text-zinc-500 dark:text-zinc-400">
                {thread.activity_title ??
                  channelMetaLabel(thread)}
              </span>
            </span>
          </Link>
        ))}
        <button
          type="button"
          onClick={onCompose}
          className="flex w-full items-center gap-3 border-t border-zinc-200 px-3 py-2.5 text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-dashed border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
            aria-hidden="true"
          >
            <FiPlus className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Tạo luồng mới
          </span>
        </button>
      </div>
    </section>
  );
}
