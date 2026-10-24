import { useState } from "react";
import type { ReactElement } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useRoomThreads } from "../channel-hooks.ts";
import { useSendChatMessage } from "../hooks.ts";
import {
  channelMetaLabel,
  toVietnameseWorkspaceMessage,
} from "../messages.tsx";
import { threadShareBody } from "./thread-share.tsx";

interface ShareThreadDialogProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  roomId: string;
}

const ROW =
  "flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zinc-50 " +
  "focus-visible:outline-2 focus-visible:-outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:hover:bg-zinc-900 " +
  "dark:focus-visible:outline-zinc-400";

// Existing sub-threads of the open parent room. A row sends that
// thread into the current conversation as a normal message.
export function ShareThreadDialog({
  open,
  onClose,
  orgId,
  roomId,
}: ShareThreadDialogProps): ReactElement {
  const threads = useRoomThreads(open ? orgId : null, roomId);
  const send = useSendChatMessage(roomId);
  const [error, setError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setError(null);
  }
  const items = (threads.data?.items ?? []).filter(
    (thread) => thread.archived_at === null,
  );

  function share(threadId: string, name: string): void {
    setError(null);
    send.mutate(
      { body: threadShareBody(threadId, name) },
      {
        onSuccess: onClose,
        onError: (err) =>
          setError(
            toVietnameseWorkspaceMessage(
              err instanceof ApiError ? err.code : "REQUEST_FAILED",
            ),
          ),
      },
    );
  }

  return (
    <Modal open={open} title="Luồng có sẵn" onClose={onClose}>
      <div className="flex flex-col gap-2">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Chọn một luồng để gửi vào cuộc trò chuyện này. Bấm tin đó
          sẽ mở luồng.
        </p>
        {threads.isPending && <LoadingState label="Đang tải luồng…" />}
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
            message="Tạo sự kiện nhanh, hoặc mở thông tin phòng để tạo luồng."
          />
        )}
        {items.length > 0 && (
          <ul className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            {items.map((thread) => (
              <li key={thread.channel_id}>
                <button
                  type="button"
                  disabled={send.isPending}
                  onClick={() => share(thread.channel_id, thread.name)}
                  className={`${ROW} w-full text-left disabled:opacity-60`}
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
                      {thread.activity_title ?? channelMetaLabel(thread)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {error !== null && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
