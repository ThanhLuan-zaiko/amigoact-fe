import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import { FiArrowDown } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import {
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import {
  useChatMessages,
  useChatReads,
  useDeleteChatMessage,
  useMarkChatRead,
  usePinMessage,
  useToggleReaction,
  useUnpinMessage,
} from "../hooks.ts";
import type { ChatMessage } from "../api.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { useChatAutoScroll } from "../chat-scroll.ts";
import { ChatComposerBar } from "./ChatComposerBar.tsx";
import { ChatMessageList } from "./ChatMessageList.tsx";
import { ChatPanelHeader } from "./ChatPanelHeader.tsx";
import { ChatPinnedBar } from "./ChatPinnedBar.tsx";
import { ChatRoomInfo } from "./ChatRoomInfo.tsx";

interface ChatPanelProps {
  roomId: string;
  // Info modal roster needs the room's org (null while inbox loads).
  orgId: string | null;
  // Public slug + name of the room's org: community share card.
  orgSlug?: string;
  orgName?: string;
  title: string;
  avatarUrl?: string | null;
  subtitle: string | null;
  // Group rooms name each sender above the bubble; dm rows stay bare.
  showAuthor: boolean;
  // dm rooms show the double-check receipt + peer last-seen in the subtitle.
  isDm: boolean;
  // Channel rooms: # icon + post_policy gate for the composer.
  isChannel?: boolean;
  postPolicy?: "everyone" | "managers" | null;
  // Sub-thread rooms: parent context link in the header. The room
  // info panel also hides the thread list (threads never nest).
  parentRoom?: { room_id: string; title: string } | null;
  // General rooms and top channels can open focused sub-threads.
  showThreads?: boolean;
  selfId?: string;
  canManage: boolean;
  unread: number;
  typingUsers: { name: string; avatar_url: string | null }[];
  // Two-screen flow (<lg): back returns to the inbox list.
  onBack?: () => void;
}

// Telegram conversation surface: pinned header + scrollable bubble flow
// + pinned composer, filling the column (phone tab bar accounted for).
export function ChatPanel({
  roomId,
  orgId,
  orgSlug = "",
  orgName = "",
  title,
  avatarUrl,
  subtitle,
  showAuthor,
  isDm,
  isChannel = false,
  postPolicy = null,
  parentRoom = null,
  showThreads = false,
  selfId,
  canManage,
  unread,
  typingUsers,
  onBack,
}: ChatPanelProps): ReactElement {
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editing, setEditing] = useState<ChatMessage | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const chat = useChatMessages(roomId);
  const reads = useChatReads(isDm ? null : roomId);
  const remove = useDeleteChatMessage(roomId);
  const markRead = useMarkChatRead(roomId);
  const react = useToggleReaction(roomId);
  const pin = usePinMessage(roomId);
  const unpin = useUnpinMessage(roomId);

  // Pages arrive newest-chunk first; the room renders oldest at the top.
  const items = useMemo<ChatMessage[]>(() => {
    const pages = chat.data?.pages ?? [];
    return [...pages].reverse().flatMap((page) => page.items);
  }, [chat.data]);
  const page = chat.data?.pages[0];
  const lastRead = page?.last_read_message_id ?? null;
  const peerLastRead = page?.peer_last_read_message_id ?? null;
  const pinned = page?.pinned ?? [];
  const muted = page?.muted ?? false;
  const latest = items.at(-1);
  const {
    scrollRef,
    atBottom,
    pendingNew,
    onScroll,
    scrollToLatest,
    jumpTo,
  } = useChatAutoScroll(items, {
    canLoadMore: () => chat.hasNextPage,
    loadOlder: () => chat.fetchNextPage(),
  });

  // Viewing the newest message moves the read pointer forward.
  useEffect(() => {
    if (latest && latest.message_id !== lastRead && !markRead.isPending) {
      markRead.mutate(latest.message_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latest?.message_id, lastRead]);

  function clearContext(): void {
    setReplyTo(null);
    setEditing(null);
  }

  return (
    <div className="flex h-[calc(100dvh-109px)] min-h-0 flex-col sm:h-[calc(100dvh-53px)]">
      <ChatPanelHeader
        title={title}
        avatarUrl={avatarUrl}
        subtitle={subtitle}
        isChannel={isChannel}
        parentRoom={parentRoom}
        onBack={onBack}
        onInfo={() => setInfoOpen(true)}
      />
      {pinned.length > 0 && (
        <ChatPinnedBar
          pinned={pinned}
          canManage={canManage}
          onUnpin={(id) => unpin.mutate(id)}
          onJump={(id) => void jumpTo(id)}
        />
      )}
      {chat.isPending && (
        <div className="flex flex-1 items-center justify-center">
          <LoadingState label="Đang tải tin nhắn…" />
        </div>
      )}
      {chat.isError && (
        <div className="flex flex-1 items-center justify-center px-4">
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
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3"
            aria-live="polite"
          >
            <ChatMessageList
              items={items}
              selfId={selfId}
              canManage={canManage}
              showAuthor={showAuthor}
              isDm={isDm}
              lastRead={lastRead}
              peerLastRead={peerLastRead}
              readers={reads.data?.items ?? []}
              unread={unread}
              hasNextPage={chat.hasNextPage}
              isFetchingNextPage={chat.isFetchingNextPage}
              onLoadOlder={() => void chat.fetchNextPage()}
              onReply={(message) => {
                setEditing(null);
                setReplyTo(message);
              }}
              onEdit={(message) => {
                setReplyTo(null);
                setEditing(message);
              }}
              onDelete={(id) => remove.mutate(id)}
              onReact={(messageId, emoji) =>
                react.mutate({ messageId, emoji })
              }
              onPin={
                canManage ? (id) => pin.mutate(id) : undefined
              }
              onJumpTo={(id) => void jumpTo(id)}
              typingUsers={typingUsers}
            />
          </div>
          {!atBottom && (
            <button
              type="button"
              onClick={scrollToLatest}
              aria-label="Xuống tin nhắn mới nhất"
              className="absolute bottom-3 right-3 flex h-10 items-center gap-1 rounded-full border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <FiArrowDown className="h-4 w-4" aria-hidden="true" />
              {pendingNew > 0 && <span>{pendingNew}</span>}
            </button>
          )}
        </div>
      )}
      <ChatComposerBar
        roomId={roomId}
        replyTo={replyTo}
        editing={editing}
        onClearContext={clearContext}
        onJumpTo={(id) => void jumpTo(id)}
        onSent={scrollToLatest}
        disabledReason={
          postPolicy === "managers" && !canManage ? "Chỉ quản lý mới được đăng trong kênh này." : null
        }
      />
      <ChatRoomInfo
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        roomId={roomId}
        orgId={orgId}
        orgSlug={orgSlug}
        orgName={orgName}
        title={title}
        isDm={isDm}
        isChannel={isChannel}
        showThreads={showThreads}
        muted={muted}
        canManage={canManage}
      />
    </div>
  );
}
