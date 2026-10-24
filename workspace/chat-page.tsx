import { useMemo, useState } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../auth/hooks.ts";
import { EmptyState } from "../core/components/Feedback.tsx";
import { useMediaQuery } from "../core/media-query.ts";
import { useOrgMembers } from "../dashboard/members-hooks.ts";
import {
  useOrgPresence,
  usePresenceIds,
} from "../dashboard/presence-hooks.ts";
import { useChatInbox } from "./hooks.ts";
import { formatLastSeen } from "./messages.tsx";
import {
  useChatRealtime,
  useTypingUsers,
} from "./realtime-hooks.ts";
import { ChatInboxRail } from "./components/ChatInboxRail.tsx";
import { ChatPanel } from "./components/ChatPanel.tsx";
import { QuickEventDialog } from "./components/QuickEventDialog.tsx";
import { ShareThreadDialog } from "./components/ShareThreadDialog.tsx";

// Telegram flow on /manage/chat: the merged cross-org inbox lives in the
// right rail on lg+ and IS the first screen below that (?room= picks the
// conversation, no param shows the list). Inbox realtime is app-wide via
// ChatInboxRealtime in App.tsx, so the rail badge lights up everywhere.
export function WorkspaceChatPage(): ReactElement {
  const session = useSession();
  const selfId = session.data?.id;
  const signedIn = selfId !== undefined;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [searchParams, setSearchParams] = useSearchParams();
  const roomId = searchParams.get("room");
  // Holds the general room the quick-event dialog was opened from.
  // A room change drops it, so the dialog never follows a thread.
  const [quickFor, setQuickFor] = useState<string | null>(null);
  const [shareFor, setShareFor] = useState<string | null>(null);

  const inbox = useChatInbox(signedIn);
  const inboxItems = inbox.data?.items ?? [];

  const room =
    inboxItems.find((item) => item.room_id === roomId) ?? null;
  const roomOrgId = room?.org_id ?? null;
  // Sub-thread rooms link back to the room they hang under.
  const parentRoom =
    room?.parent_room_id != null
      ? (inboxItems.find(
          (item) => item.room_id === room.parent_room_id,
        ) ?? null)
      : null;
  // Only general rooms and top channels can open sub-threads.
  const showThreads =
    room !== null &&
    (room.kind === "general" ||
      (room.kind === "channel" && room.parent_room_id === null));

  // Presence + roster power the dm online subtitle and typing names.
  useOrgPresence(roomOrgId);
  const onlineIds = usePresenceIds(roomOrgId);
  // The members endpoint caps limit at 50; a larger value is a 422 and
  // silently empties memberNames/viewer_permissions/subtitle.
  const members = useOrgMembers(roomOrgId, {
    limit: 50,
    status: "active",
  });
  const { typingIds, noteTyping } = useTypingUsers();
  useChatRealtime(roomId, selfId, noteTyping, room?.kind === "dm");

  const memberBriefs = useMemo(() => {
    const map = new Map<
      string,
      { name: string; avatar_url: string | null }
    >();
    for (const item of members.data?.items ?? []) {
      map.set(item.user_id, {
        name: item.full_name,
        avatar_url: item.avatar_url,
      });
    }
    return map;
  }, [members.data]);

  const typingUsers = typingIds.map(
    (id) =>
      memberBriefs.get(id) ?? {
        name: "Một thành viên",
        avatar_url: null,
      },
  );
  const permissions = members.data?.viewer_permissions ?? [];
  const viewerRole = members.data?.viewer_role ?? "member";
  const canManage = permissions.includes("chat:manage");
  // Org head owns the general room. Anyone else needs activity:create.
  // The activity API applies the same owner-or-permission gate.
  const canCreateEvent =
    showThreads &&
    (viewerRole === "owner" ||
      permissions.includes("activity:create"));
  const manageActivityTo =
    room?.activity_id !== null &&
    room?.activity_id !== undefined &&
    roomOrgId !== null &&
    (permissions.includes("activity:create") ||
      permissions.includes("activity:manage"))
      ? `/manage/events/${roomOrgId}/${room.activity_id}`
      : undefined;

  const subtitle = useMemo(() => {
    if (room === null) return null;
    if (room.kind === "dm") {
      const online =
        room.peer_id !== null && onlineIds.has(room.peer_id);
      if (online) return "Đang online";
      return formatLastSeen(room.peer_last_seen_at) ?? room.org_name;
    }
    const total = members.data?.total;
    const count = total === undefined ? null : `${total} thành viên`;
    const online =
      onlineIds.size > 0 ? `${onlineIds.size} đang online` : null;
    const parts = [
      room.kind === "activity" ? room.org_name : null,
      count,
      online,
    ].filter((part) => part !== null);
    return parts.length === 0 ? null : parts.join(" · ");
  }, [room, members.data, onlineIds]);

  function backToInbox(): void {
    const next = new URLSearchParams(searchParams);
    next.delete("room");
    setSearchParams(next, { replace: true });
  }

  if (roomId === null && (quickFor !== null || shareFor !== null)) {
    setQuickFor(null);
    setShareFor(null);
  }

  if (roomId === null) {
    if (!isDesktop) return <ChatInboxRail />;
    return (
      <div className="flex h-[calc(100dvh-53px)] items-center justify-center px-6">
        <EmptyState
          title="Chọn một cuộc trò chuyện"
          message="Chọn một phòng ở danh sách bên phải để bắt đầu nhắn tin."
        />
      </div>
    );
  }

  return (
    <>
    <ChatPanel
      key={roomId}
      roomId={roomId}
      orgId={roomOrgId}
      orgSlug={room?.org_slug ?? ""}
      orgName={room?.org_name ?? ""}
      title={room?.title ?? "Trò chuyện"}
      avatarUrl={room?.avatar_url ?? null}
      subtitle={subtitle}
      showAuthor={room?.kind !== "dm"}
      isDm={room?.kind === "dm"}
      isChannel={room?.kind === "channel"}
      postPolicy={room?.post_policy ?? null}
      parentRoom={
        parentRoom !== null
          ? { room_id: parentRoom.room_id, title: parentRoom.title }
          : null
      }
      showThreads={showThreads}
      selfId={selfId}
      canManage={canManage}
      typingUsers={typingUsers}
      onBack={isDesktop ? undefined : backToInbox}
      onQuickEvent={
        canCreateEvent && roomId !== null
          ? () => setQuickFor(roomId)
          : undefined
      }
      onShareThread={
        showThreads && roomId !== null
          ? () => setShareFor(roomId)
          : undefined
      }
      manageActivityTo={manageActivityTo}
    />
    {roomOrgId !== null && roomId !== null && (
      <QuickEventDialog
        open={quickFor === roomId}
        onClose={() => setQuickFor(null)}
        orgId={roomOrgId}
        roomId={roomId}
        onCreated={(threadId) => {
          setQuickFor(null);
          setSearchParams({ room: threadId, inbox: "threads" });
        }}
      />
    )}
    {roomOrgId !== null && roomId !== null && (
      <ShareThreadDialog
        open={shareFor === roomId}
        onClose={() => setShareFor(null)}
        orgId={roomOrgId}
        roomId={roomId}
      />
    )}
    </>
  );
}
