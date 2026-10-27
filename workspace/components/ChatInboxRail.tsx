import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiEdit3, FiHash, FiSearch } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useSession } from "../../auth/hooks.ts";
import { useMyMemberships } from "../../dashboard/members-hooks.ts";
import type { InboxRoom } from "../api.ts";
import { useChatInbox } from "../hooks.ts";
import {
  chatRoomHref,
  filterInboxItems,
  parseInboxTab,
  tabForRoom,
  type InboxTab,
} from "../inbox-tab.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ChatInboxList } from "./ChatInboxList.tsx";
import { ChannelBrowserDialog } from "./ChannelBrowserDialog.tsx";
import { NewDmDialog } from "./NewDmDialog.tsx";

const INBOX_TABS: { value: InboxTab; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "unread", label: "Chưa đọc" },
  { value: "threads", label: "Luồng" },
];

// The merged inbox surface: search + folder tabs + compose over the
// cross-org ChatInboxList (each row already names its org in the
// preview line). The "all" tab keeps main conversations (general,
// activity, dm) so channels never crowd it. An activity room drops
// out of "all" once a sub-thread is linked to that activity, so the
// event is not listed twice. The "threads" tab is the only one
// listing channel rooms (top channels + sub-threads); the
// "unread" tab keeps every room with unseen messages regardless of
// kind. Rendered inside the right rail on lg+ and as the center-column
// list screen on smaller viewports.
export function ChatInboxRail(): ReactElement {
  const session = useSession();
  const selfId = session.data?.id;
  const signedIn = selfId !== undefined;
  const memberships = useMyMemberships("active", signedIn);
  const inbox = useChatInbox(signedIn);
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  const [term, setTerm] = useState("");
  const [composing, setComposing] = useState(false);
  const [browsing, setBrowsing] = useState(false);

  const orgs = useMemo(
    () =>
      (memberships.data?.items ?? []).map((item) => ({
        id: item.org_id,
        name: item.org_name,
      })),
    [memberships.data],
  );

  const inboxItems = inbox.data?.items;
  const openRoom = (inboxItems ?? []).find((row) => row.room_id === roomId);
  const followTab: InboxTab =
    openRoom !== undefined ? tabForRoom(openRoom) : "all";
  const tab: InboxTab = parseInboxTab(searchParams.get("inbox")) ?? followTab;
  const items = useMemo(
    () => filterInboxItems(inboxItems ?? [], tab, term),
    [inboxItems, tab, term],
  );

  const unreadCount = (inbox.data?.items ?? []).filter(
    (room) => room.unread > 0,
  ).length;

  function makeTo(room: InboxRoom): string {
    return chatRoomHref(room.room_id, tabForRoom(room));
  }

  function pickFolder(folder: InboxTab): void {
    const next = new URLSearchParams(searchParams);
    next.set("inbox", folder);
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="flex flex-col pb-4">
      {/* Inside the center column (<lg) it must clear the 53px sticky
          CenterHeader; in the aside's own scroller (lg+) top-0. */}
      <div className="sticky top-[53px] z-10 bg-white px-4 pb-2 pt-3 lg:top-0 dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <TextField
            label="Tìm cuộc trò chuyện"
            hideLabel
            pill
            name="chat-inbox-q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Tìm cuộc trò chuyện"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            icon={<FiSearch className="h-4 w-4" />}
            className="min-w-0 flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setBrowsing(true)}
            aria-label="Danh sách kênh"
            title="Danh sách kênh"
            icon={<FiHash className="h-5 w-5" aria-hidden="true" />}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setComposing(true)}
            aria-label="Soạn tin nhắn mới"
            title="Soạn tin nhắn mới"
            icon={<FiEdit3 className="h-5 w-5" aria-hidden="true" />}
          />
        </div>
        <div
          role="tablist"
          aria-label="Lọc cuộc trò chuyện"
          className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900"
        >
          {INBOX_TABS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => pickFolder(value)}
              className={`flex min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400 ${
                tab === value
                  ? "bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              <span className="truncate">{label}</span>
              {value === "unread" && unreadCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-zinc-900 px-1 text-[10px] font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {inbox.isPending && (
        <div className="px-4 py-6">
          <LoadingState label="Đang tải hộp thư…" />
        </div>
      )}
      {inbox.isError && (
        <div className="px-4 py-6">
          <ErrorState
            title="Không tải được hộp thư"
            message={toVietnameseWorkspaceMessage(
              inbox.error instanceof ApiError
                ? inbox.error.code
                : "REQUEST_FAILED",
            )}
          />
        </div>
      )}
      {inbox.data !== undefined && items.length === 0 && (
        <div className="px-4 py-6">
          <EmptyState
            title={
              term !== ""
                ? "Không có kết quả"
                : tab === "unread"
                  ? "Đã đọc hết"
                  : tab === "threads"
                    ? "Chưa có kênh hay luồng nào"
                    : "Chưa có cuộc trò chuyện"
            }
            message={
              term !== ""
                ? "Thử từ khóa khác hoặc xóa bộ lọc."
                : tab === "unread"
                  ? "Các phòng có tin mới sẽ hiện ở đây."
                  : tab === "threads"
                    ? "Tạo kênh từ danh sách kênh, hoặc mở thông tin một phòng để tạo luồng."
                    : "Các phòng chung, phòng hoạt động và tin nhắn riêng sẽ hiện ở đây."
            }
          />
        </div>
      )}
      {items.length > 0 && (
        <ChatInboxList
          items={items}
          activeRoomId={roomId}
          makeTo={makeTo}
        />
      )}

      <NewDmDialog
        open={composing}
        onClose={() => setComposing(false)}
        orgs={orgs}
        selfId={selfId}
        onOpened={(room) => {
          setComposing(false);
          setSearchParams(
            { room, inbox: "all" },
            { replace: true },
          );
        }}
      />
      <ChannelBrowserDialog
        open={browsing}
        onClose={() => setBrowsing(false)}
        orgs={orgs}
      />
    </div>
  );
}
