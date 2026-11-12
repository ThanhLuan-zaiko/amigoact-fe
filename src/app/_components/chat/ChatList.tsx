"use client";

import { useState } from "react";
import { FiEdit, FiMessageCircle, FiSearch, FiX } from "react-icons/fi";
import type { ChatResult, ChatRoom } from "@/lib/chat";
import {
  filterRooms,
  INBOX_FILTERS,
  type InboxFilter,
  totalUnread,
} from "@/lib/messenger";
import { type TypingMap, typingText } from "@/lib/typing";
import {
  iconButton,
  inputField,
  mutedText,
  segmentActive,
  segmentIdle,
  segmentItem,
} from "../ui";
import ChatListRow from "./ChatListRow";
import NewChatDialog from "./NewChatDialog";

type ChatListProps = {
  rooms: ChatRoom[];
  typing: TypingMap;
  activeId: string | null;
  viewerId: string;
  onSelect: (roomId: string) => void;
  onOpenDm: (slug: string, userId: string) => Promise<ChatResult>;
};

// The left column: search, filters, and every conversation, newest activity first.
export default function ChatList({
  rooms,
  typing,
  activeId,
  viewerId,
  onSelect,
  onOpenDm,
}: ChatListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<InboxFilter>("all");
  const [composing, setComposing] = useState(false);
  const shown = filterRooms(rooms, filter, query);
  const unread = totalUnread(rooms);

  return (
    <nav aria-label="Cuộc trò chuyện" className="flex h-full min-h-0 flex-col">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="flex flex-1 items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
            <FiMessageCircle aria-hidden="true" />
            Tin nhắn
          </h1>
          <button
            type="button"
            onClick={() => setComposing(true)}
            aria-label="Tin nhắn mới"
            title="Tin nhắn mới"
            className={iconButton}
          >
            <FiEdit aria-hidden="true" />
          </button>
        </div>
        <div className="relative">
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Tìm cuộc trò chuyện"
            placeholder="Tìm kiếm"
            className={`${inputField} py-2 pr-9 pl-9`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Xóa tìm kiếm"
              title="Xóa tìm kiếm"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            >
              <FiX aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div
          role="tablist"
          aria-label="Lọc cuộc trò chuyện"
          className="flex gap-1 overflow-x-auto [scrollbar-width:none]"
        >
          {INBOX_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={`${segmentItem} px-2 py-1 text-xs sm:px-2 ${filter === item.value ? segmentActive : segmentIdle}`}
            >
              {item.label}
              {item.value === "unread" && unread > 0 ? ` (${unread})` : null}
            </button>
          ))}
        </div>
      </div>
      {shown.length === 0 ? (
        <p className={`${mutedText} p-6 text-center`}>
          {rooms.length === 0
            ? "Tham gia một tổ chức để bắt đầu trò chuyện."
            : "Không có cuộc trò chuyện phù hợp."}
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2">
          {shown.map((room) => (
            <ChatListRow
              key={room.room_id}
              room={room}
              typing={typingText(typing[room.room_id], room.kind)}
              active={room.room_id === activeId}
              viewerId={viewerId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
      {composing ? (
        <NewChatDialog
          onClose={() => setComposing(false)}
          onPick={async (slug, userId) => {
            const result = await onOpenDm(slug, userId);
            if (result.ok) {
              setComposing(false);
            }
            return result;
          }}
        />
      ) : null}
    </nav>
  );
}
