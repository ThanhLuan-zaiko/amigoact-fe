import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiSend, FiTrash2, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Section } from "../../core/components/Section.tsx";
import { Button } from "../../core/components/Button.tsx";
import {
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import {
  useChatMessages,
  useDeleteChatMessage,
  useMarkChatRead,
  useSendChatMessage,
} from "../hooks.ts";
import { sendChatTyping } from "../realtime-hooks.ts";
import type { ChatMessage } from "../api.ts";
import { formatTime, toVietnameseWorkspaceMessage } from "../messages.tsx";

interface ChatPanelProps {
  roomId: string;
  roomLabel: string;
  selfId?: string;
  canManage: boolean;
  onlineCount?: number;
  typingNames: string[];
}

// One chat room: oldest history on top ("load older" button), newest at
// the bottom with a typing strip above the composer.
export function ChatPanel({
  roomId,
  roomLabel,
  selfId,
  canManage,
  onlineCount,
  typingNames,
}: ChatPanelProps): ReactElement {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const chat = useChatMessages(roomId);
  const send = useSendChatMessage(roomId);
  const remove = useDeleteChatMessage(roomId);
  const markRead = useMarkChatRead(roomId);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Pages arrive newest-chunk first; the room renders oldest at the top.
  const items = useMemo<ChatMessage[]>(() => {
    const pages = chat.data?.pages ?? [];
    return [...pages].reverse().flatMap((page) => page.items);
  }, [chat.data]);
  const lastRead = chat.data?.pages[0]?.last_read_message_id ?? null;
  const latest = items.at(-1);

  // Viewing the newest message moves the read pointer forward.
  useEffect(() => {
    if (latest && latest.message_id !== lastRead && !markRead.isPending) {
      markRead.mutate(latest.message_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.message_id, lastRead]);

  // Keep the tail in view while the user is already near the bottom or
  // a fresh page just landed.
  useEffect(() => {
    const node = scrollRef.current;
    if (node === null) return;
    const nearBottom =
      node.scrollHeight - node.scrollTop - node.clientHeight < 160;
    if (nearBottom) node.scrollTop = node.scrollHeight;
  }, [items.length]);

  function submit(): void {
    const body = draft.trim();
    if (!body) return;
    setError(null);
    send.mutate(body, {
      onSuccess: () => {
        setDraft("");
        const node = scrollRef.current;
        if (node) node.scrollTop = node.scrollHeight;
      },
      onError: (err) =>
        setError(
          err instanceof ApiError
            ? toVietnameseWorkspaceMessage(err.code)
            : toVietnameseWorkspaceMessage("REQUEST_FAILED"),
        ),
    });
  }

  return (
    <Section>
      <div
        data-rise
        className="flex items-center justify-between gap-2"
      >
        <h2 className="min-w-0 truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          {roomLabel}
        </h2>
        {onlineCount !== undefined && (
          <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <FiUsers className="h-4 w-4" aria-hidden="true" />
            {`${onlineCount} đang online`}
          </p>
        )}
      </div>
      {chat.isPending && (
        <div className="mt-3">
          <LoadingState label="Đang tải tin nhắn…" />
        </div>
      )}
      {chat.isError && (
        <div className="mt-3">
          <ErrorState
            title="Không tải được trò chuyện"
            message={toVietnameseWorkspaceMessage(
              chat.error instanceof ApiError
                ? chat.error.code
                : "REQUEST_FAILED",
            )}
          />
        </div>
      )}
      {chat.data !== undefined && (
        <div
          ref={scrollRef}
          className="mt-3 flex max-h-[420px] min-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
          aria-live="polite"
        >
          {chat.hasNextPage && (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void chat.fetchNextPage()}
                disabled={chat.isFetchingNextPage}
              >
                {chat.isFetchingNextPage ? "Đang tải…" : "Tải tin cũ hơn"}
              </Button>
            </div>
          )}
          {items.length === 0 && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Chưa có tin nhắn nào. Hãy là người đầu tiên nhắn tin!
            </p>
          )}
          {items.map((message) => {
            const mine = message.author_id === selfId;
            return (
              <div
                key={message.message_id}
                className={`group flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl border px-3 py-2 ${
                    mine
                      ? "border-zinc-300 bg-zinc-100 dark:border-zinc-700"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {mine ? "Bạn" : message.author_name}
                    <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
                      {formatTime(message.created_at)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-sm break-words whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                    {message.body}
                  </p>
                </div>
                {(mine || canManage) && (
                  <span className="ml-1 self-start opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove.mutate(message.message_id)}
                      aria-label="Xóa tin nhắn"
                      icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                    />
                  </span>
                )}
              </div>
            );
          })}
          {typingNames.length > 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
              {`${typingNames.join(", ")} đang nhập`}
              <span className="animate-pulse">…</span>
            </p>
          )}
        </div>
      )}
      <div className="mt-3 flex items-end gap-2">
        <TextField
          label="Nhắn tin"
          name="chat-draft"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            if (event.target.value.trim()) sendChatTyping(roomId);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Nhắn tin cho phòng này…"
          maxLength={2000}
          autoComplete="off"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="primary"
          onClick={submit}
          disabled={send.isPending || !draft.trim()}
          aria-label="Gửi tin nhắn"
          icon={<FiSend className="h-4 w-4" aria-hidden="true" />}
        >
          Gửi
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </Section>
  );
}
