import { Fragment } from "react";
import type { ReactElement } from "react";
import { Avatar } from "../../core/components/Avatar.tsx";
import { Button } from "../../core/components/Button.tsx";
import type { ChatMessage } from "../api.ts";
import { formatClock, formatDayLabel } from "../messages.tsx";
import { ChatAttachmentBlock } from "./ChatAttachmentBlock.tsx";
import { ChatMentionBody } from "./ChatMentionBody.tsx";
import { ChatMessageMenu } from "./ChatMessageMenu.tsx";
import { ChatReactionPills } from "./ChatReactionPills.tsx";

const BUBBLE =
  "min-w-0 max-w-[78%] rounded-2xl px-3 pb-1.5 pt-2 text-[15px] " +
  "leading-snug border border-zinc-200/60 dark:border-zinc-700/60";
const MINE =
  "rounded-br-md bg-zinc-900 text-white dark:bg-zinc-100 " +
  "dark:text-zinc-950";
const THEIRS =
  "rounded-bl-md bg-zinc-100 text-zinc-900 dark:bg-zinc-800 " +
  "dark:text-zinc-100";

const DIVIDER_LABEL =
  "rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium " +
  "text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";

function sameDay(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return false;
  return new Date(a).toDateString() === new Date(b).toDateString();
}

interface ChatMessageListProps {
  items: ChatMessage[];
  selfId?: string;
  canManage: boolean;
  // Group rooms name each sender above the bubble; dm rows stay bare.
  showAuthor: boolean;
  // dm rooms show the double-check receipt on the sender's bubbles.
  isDm: boolean;
  lastRead: string | null;
  peerLastRead: string | null;
  unread: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadOlder: () => void;
  onReply: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  typingNames: string[];
}

// Telegram-style flow: day pills, an "unread" seam above the first
// unseen message, aligned bubbles (own on the right), hover delete.
export function ChatMessageList({
  items,
  selfId,
  canManage,
  showAuthor,
  isDm,
  lastRead,
  peerLastRead,
  unread,
  hasNextPage,
  isFetchingNextPage,
  onLoadOlder,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  typingNames,
}: ChatMessageListProps): ReactElement {
  // UUIDv7 ids order lexicographically; the seam sits above the first
  // message beyond the server read pointer (or atop all of them when
  // nothing was ever read yet).
  const seamIndex =
    unread > 0
      ? items.findIndex(
          (m) => lastRead === null || m.message_id > lastRead,
        )
      : -1;

  return (
    <>
      {hasNextPage && (
        <div className="flex justify-center py-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onLoadOlder}
            disabled={isFetchingNextPage}
            className="px-3 py-1 text-[13px]"
          >
            {isFetchingNextPage ? "Đang tải…" : "Tải tin cũ hơn"}
          </Button>
        </div>
      )}
      {items.length === 0 && (
        <p className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Chưa có tin nhắn nào. Hãy là người đầu tiên nhắn tin!
        </p>
      )}
      {items.map((message, index) => {
        const mine = message.author_id === selfId;
        const prev = items[index - 1];
        const newDay =
          prev === undefined ||
          !sameDay(prev.created_at, message.created_at);
        return (
          <Fragment key={message.message_id}>
            {newDay && (
              <div className="flex justify-center py-2">
                <span className={DIVIDER_LABEL}>
                  {formatDayLabel(message.created_at)}
                </span>
              </div>
            )}
            {index === seamIndex && (
              <div
                className="flex items-center gap-3 py-2"
                aria-label="Tin nhắn mới"
              >
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                  Tin nhắn mới
                </span>
                <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
              </div>
            )}
            <div
              className={`group flex items-end gap-1.5 ${
                mine ? "justify-end" : "justify-start"
              }`}
            >
              {!mine && showAuthor && (
                <span className="shrink-0 self-end">
                  <Avatar
                    name={message.author_name}
                    src={message.author_avatar_url}
                    size="sm"
                  />
                </span>
              )}
              <ChatMessageMenu
                message={message}
                mine={mine}
                canManage={canManage}
                openUp={index >= items.length - 2}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={(emoji) => onReact(message.message_id, emoji)}
                onPin={onPin}
              />
              <div className={`${BUBBLE} ${mine ? MINE : THEIRS}`}>
                {!mine && showAuthor && (
                  <p className="mb-0.5 text-[13px] font-semibold text-zinc-700 dark:text-zinc-300">
                    {message.author_name}
                  </p>
                )}
                {message.reply_to_id !== null && (
                  <blockquote
                    className={`mb-1 border-l-2 pl-2 text-[13px] ${
                      mine
                        ? "border-zinc-400 text-zinc-300 dark:border-zinc-500 dark:text-zinc-600"
                        : "border-zinc-400 text-zinc-500 dark:border-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    <p className="font-semibold">
                      {message.reply_to_author ?? "Tin nhắn"}
                    </p>
                    <p className="line-clamp-2 break-words">
                      {message.reply_to_body ?? "Tin nhắn đã bị xóa"}
                    </p>
                  </blockquote>
                )}
                {message.attachments.map((item) => (
                  <ChatAttachmentBlock
                    key={item.media_id}
                    item={item}
                    mine={mine}
                  />
                ))}
                {message.body !== "" && (
                  <ChatMentionBody message={message} mine={mine} />
                )}
                <ChatReactionPills
                  reactions={message.reactions}
                  mine={mine}
                  onToggle={(emoji) => onReact(message.message_id, emoji)}
                />
                <p
                  className={`mt-0.5 text-right text-[11px] ${
                    mine
                      ? "text-zinc-400 dark:text-zinc-600"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {message.edited_at !== null && "Đã chỉnh sửa · "}
                  {formatClock(message.created_at)}
                  {mine &&
                    isDm &&
                    (peerLastRead !== null &&
                    message.message_id <= peerLastRead
                      ? " · ✓✓ Đã xem"
                      : " · ✓")}
                </p>
              </div>
            </div>
          </Fragment>
        );
      })}
      {typingNames.length > 0 && (
        <p
          className="px-1 pt-1 text-xs text-zinc-500 dark:text-zinc-400"
          aria-live="polite"
        >
          {`${typingNames.join(", ")} đang nhập`}
          <span className="animate-pulse">…</span>
        </p>
      )}
    </>
  );
}
