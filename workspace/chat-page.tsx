import { useMemo } from "react";
import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { useSession } from "../auth/hooks.ts";
import {
  useMyMemberships,
  useOrgMembers,
} from "../dashboard/members-hooks.ts";
import {
  useOrgPresence,
  usePresenceIds,
} from "../dashboard/presence-hooks.ts";
import { useOrgActivities } from "../activities/hooks.ts";
import {
  useChatUnread,
  useDmRooms,
  useWorkspaceOrg,
} from "./hooks.ts";
import { useChatRealtime, useTypingUsers } from "./realtime-hooks.ts";
import { WorkspaceOrgBar } from "./components/WorkspaceOrgBar.tsx";
import { ChatPanel } from "./components/ChatPanel.tsx";
import { ChatRoomRail } from "./components/ChatRoomRail.tsx";

const UNREAD_BADGE =
  "rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs " +
  "font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 " +
  "dark:text-amber-400";

// Org chat (/manage/chat?org=<id>&room=<id>): a room rail (general, per
// activity, direct messages) beside the live ChatPanel on chat:{room}.
export function WorkspaceChatPage(): ReactElement {
  const session = useSession();
  const selfId = session.data?.id;
  const memberships = useMyMemberships("active", session.data != null);
  const orgs = useMemo(
    () =>
      (memberships.data?.items ?? []).map((item) => ({
        id: item.org_id,
        name: item.org_name,
      })),
    [memberships.data],
  );
  const { orgId } = useWorkspaceOrg(orgs);
  const [searchParams, setSearchParams] = useSearchParams();

  // ?room= persists the selection; an absent param means the general
  // room, whose id is the org id itself.
  const roomId =
    orgId === null ? null : (searchParams.get("room") ?? orgId);

  function selectRoom(id: string): void {
    if (id === roomId) return;
    const next = new URLSearchParams(searchParams);
    if (id === orgId) {
      next.delete("room");
    } else {
      next.set("room", id);
    }
    setSearchParams(next, { replace: true });
  }

  // Org switch discards the room - a room id only means something inside
  // its own org, so the new org always starts on the general room.
  function pickOrg(id: string): void {
    const next = new URLSearchParams(searchParams);
    next.set("org", id);
    next.delete("room");
    setSearchParams(next, { replace: true });
  }

  // Presence + roster power the online count and typing display names.
  useOrgPresence(orgId);
  const onlineIds = usePresenceIds(orgId);
  const members = useOrgMembers(orgId, { limit: 100, status: "active" });
  const activities = useOrgActivities(orgId);
  const dmRooms = useDmRooms(orgId);
  const unread = useChatUnread(roomId);
  const { typingIds, noteTyping } = useTypingUsers();
  useChatRealtime(roomId, selfId, noteTyping);

  const memberNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of members.data?.items ?? []) {
      map.set(item.user_id, item.full_name);
    }
    return map;
  }, [members.data]);

  const roomLabel = useMemo(() => {
    if (roomId === null) return "Trò chuyện";
    if (roomId === orgId) return "Phòng chung";
    const activity = (activities.data ?? []).find(
      (item) => item.id === roomId,
    );
    if (activity) return activity.title;
    const dm = (dmRooms.data?.items ?? []).find(
      (item) => item.room_id === roomId,
    );
    if (dm) return dm.peer_name;
    return "Phòng trò chuyện";
  }, [roomId, orgId, activities.data, dmRooms.data]);

  const memberList = members.data?.items ?? [];
  const typingNames = typingIds.map(
    (id) => memberNames.get(id) ?? "Một thành viên",
  );
  const canManage = (members.data?.viewer_permissions ?? []).includes(
    "chat:manage",
  );
  const unreadCount = unread.data?.unread ?? 0;

  return (
    <>
      <WorkspaceOrgBar
        orgs={memberships.data === undefined ? undefined : orgs}
        orgId={orgId}
        title="Trò chuyện tổ chức"
        onSelect={pickOrg}
        trailing={
          unreadCount > 0 ? (
            <span
              className={UNREAD_BADGE}
              aria-label={`${unreadCount} tin nhắn chưa đọc`}
            >
              {`${unreadCount} chưa đọc`}
            </span>
          ) : undefined
        }
      />
      {orgId !== null && roomId !== null && (
        <>
          <ChatRoomRail
            orgId={orgId}
            roomId={roomId}
            selfId={selfId}
            members={memberList}
            onSelect={selectRoom}
          />
          <ChatPanel
            roomId={roomId}
            roomLabel={roomLabel}
            selfId={selfId}
            canManage={canManage}
            onlineCount={onlineIds.size}
            typingNames={typingNames}
          />
        </>
      )}
    </>
  );
}
