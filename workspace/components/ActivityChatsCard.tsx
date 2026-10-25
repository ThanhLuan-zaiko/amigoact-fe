import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { RAIL_ROW, RailCard } from "../../core/components/RailCard.tsx";
import { useChatInbox } from "../hooks.ts";
import { chatRoomHref } from "../inbox-tab.ts";

const MAX_ROWS = 5;

// Event chat rooms from the /manage/chat inbox, unread rooms first. Each row
// links into the conversation on /manage/chat.
export function ActivityChatsCard(): ReactElement {
  const inbox = useChatInbox(true);
  const rooms = (inbox.data?.items ?? [])
    .filter((room) => room.kind === "activity")
    .sort((a, b) => b.unread - a.unread)
    .slice(0, MAX_ROWS);

  return (
    <RailCard title="Chat sự kiện" moreTo="/manage/chat">
      {inbox.isPending && (
        <div className="px-4 pb-4">
          <LoadingState label="Đang tải hộp thư…" />
        </div>
      )}
      {inbox.isError && (
        <div className="px-4 pb-4">
          <ErrorState
            title="Không tải được"
            message="Thử lại sau ít phút."
          />
        </div>
      )}
      {inbox.isSuccess && rooms.length === 0 && (
        <div className="px-4 pb-4">
          <EmptyState
            title="Chưa có phòng chat nào"
            message="Phòng chat của mỗi sự kiện sẽ hiện ở đây."
          />
        </div>
      )}
      <ul>
        {rooms.map((room) => (
          <li key={room.room_id}>
            <Link to={chatRoomHref(room.room_id, "all")} className={RAIL_ROW}>
              <span className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {room.title}
                </span>
                {room.unread > 0 && (
                  <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
                    {room.unread > 99 ? "99+" : room.unread}
                  </span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400">
                {room.org_name}
                {room.last_body !== null && ` · ${room.last_body}`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </RailCard>
  );
}
