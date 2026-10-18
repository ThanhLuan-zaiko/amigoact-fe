import { useMemo } from "react";
import type { ReactElement } from "react";
import { useSession } from "../../auth/hooks.ts";
import { useMyMemberships } from "../../dashboard/members-hooks.ts";
import { useChatInboxRealtime } from "../realtime-hooks.ts";

// Inbox hints must reach the viewer on every page: the rail badge sums
// room.unread from GET /chat/inbox, so scope:"chat-inbox" frames have to
// invalidate it even outside /manage/chat. Mounted once in App next to
// MembershipRealtime so the subscription set never double-subscribes.
export function ChatInboxRealtime(): ReactElement | null {
  const session = useSession();
  const selfId = session.data?.id;
  const memberships = useMyMemberships("active", selfId !== undefined);
  const orgIds = useMemo(
    () => (memberships.data?.items ?? []).map((item) => item.org_id),
    [memberships.data],
  );
  useChatInboxRealtime(selfId, orgIds);
  return null;
}
