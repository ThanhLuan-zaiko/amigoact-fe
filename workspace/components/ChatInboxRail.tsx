import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiEdit3, FiSearch } from "react-icons/fi";
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
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import { ChatInboxList } from "./ChatInboxList.tsx";
import { NewDmDialog } from "./NewDmDialog.tsx";

// The merged inbox surface: search + compose over the cross-org
// ChatInboxList (each row already names its org in the preview line, so
// no folder chips). Rendered inside the right rail on lg+ and as the
// center-column list screen on smaller viewports.
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

  const orgs = useMemo(
    () =>
      (memberships.data?.items ?? []).map((item) => ({
        id: item.org_id,
        name: item.org_name,
      })),
    [memberships.data],
  );

  const items = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (needle === "") return inbox.data?.items ?? [];
    return (inbox.data?.items ?? []).filter((room) =>
      `${room.title} ${room.org_name} ${room.last_body ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [inbox.data, term]);

  function makeTo(room: InboxRoom): string {
    return `?room=${encodeURIComponent(room.room_id)}`;
  }

  return (
    <div className="flex flex-col pb-4">
      {/* Inside the center column (<lg) it must clear the 53px sticky
          CenterHeader; in the aside's own scroller (lg+) top-0. */}
      <div className="sticky top-[53px] z-10 bg-white px-4 py-2 lg:top-0 dark:bg-zinc-950">
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
            onClick={() => setComposing(true)}
            aria-label="Soạn tin nhắn mới"
            title="Soạn tin nhắn mới"
            icon={<FiEdit3 className="h-5 w-5" aria-hidden="true" />}
          />
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
              term !== "" ? "Không có kết quả" : "Chưa có cuộc trò chuyện"
            }
            message={
              term !== ""
                ? "Thử từ khóa khác hoặc xóa bộ lọc."
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
          const next = new URLSearchParams();
          next.set("room", room);
          setSearchParams(next, { replace: true });
        }}
      />
    </div>
  );
}
