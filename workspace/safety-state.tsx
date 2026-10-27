// What the composer may do right now: muted, or limited in attachments.
import { useOrgMembers } from "../dashboard/members-hooks.ts";
import { formatTime } from "./messages.tsx";
import { useChatSafety } from "./safety-hooks.ts";

export interface ComposerSafety {
  // Replaces the input while the viewer is muted.
  blockedReason: string | null;
  canAttach: boolean;
}

// Pass null for dm rooms: org timeouts and file rules never apply there.
export function useComposerSafety(orgId: string | null): ComposerSafety {
  const safety = useChatSafety(orgId);
  // Same params as the chat page, so the roster query is shared.
  const members = useOrgMembers(orgId, { limit: 50, status: "active" });
  const until = safety.data?.my_timeout_until ?? null;
  // The server only reports a timeout that is still running, and the query
  // polls while one is active, so a non-null value means muted right now.
  const muted = until !== null;
  const privileged =
    members.data?.viewer_role === "owner" ||
    (members.data?.viewer_permissions ?? []).includes("chat:attach");
  return {
    blockedReason: muted
      ? `Bạn đang bị tạm cấm chat đến ${formatTime(until)}.`
      : null,
    canAttach: !(safety.data?.attach_restricted ?? false) || privileged,
  };
}
