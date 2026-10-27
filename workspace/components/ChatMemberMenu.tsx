import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiMessageCircle,
  FiMinusCircle,
  FiPlay,
  FiUserX,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { ActionMenu } from "../../core/components/ActionMenu.tsx";
import type { MenuAction } from "../../core/components/ActionMenu.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { pushToast } from "../../core/toast.ts";
import {
  useRemoveMember,
  useUpdateMember,
} from "../../dashboard/members-hooks.ts";
import { canActOnMember, hasPermission, memberRights } from "../../dashboard/members-utils.ts";
import { toVietnameseDashboardMessage } from "../../dashboard/messages.tsx";
import { memberMutationToast } from "../../dashboard/messages-members.tsx";
import { memberConfirmCopy } from "../../dashboard/messages-roles.tsx";
import type { DashboardMember } from "../../dashboard/members-api.ts";
import { useChatSafety, useLiftTimeout, useTimeoutMember } from "../safety-hooks.ts";
import { ChatTimeoutDialog } from "./ChatTimeoutDialog.tsx";

interface ChatMemberMenuProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  isSelf: boolean;
  // Last rows flip the panel upward so it never clips the panel edge.
  openUp?: boolean;
  onMessage: (userId: string) => void;
}

// Per-member overflow menu inside ChatRoomInfo: DM for everyone, plus
// suspend/reactivate/remove gated by the same memberRights rules as
// /manage/members (same endpoints and member:* permission codes; org rooms
// are membership-derived so removal ejects the user from every room).
export function ChatMemberMenu({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  isSelf,
  openUp = false,
  onMessage,
}: ChatMemberMenuProps): ReactElement | null {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [timingOut, setTimingOut] = useState(false);
  const safety = useChatSafety(orgId);
  const mute = useTimeoutMember(orgId);
  const unmute = useLiftTimeout(orgId);
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const busy = update.isPending || remove.isPending || unmute.isPending;

  const rights = memberRights(viewerRole, viewerPermissions, member, isSelf);
  const canMessage = !isSelf;
  // The server still refuses staff-on-staff mutes; this only hides the
  // entry for targets that can never be muted (self, owner, admins).
  const canMute =
    hasPermission(viewerRole, viewerPermissions, "chat:timeout") &&
    canActOnMember(viewerRole, member, isSelf);
  const muted = safety.data?.timeouts.some((item) => item.user_id === member.user_id) ?? false;
  if (!canMessage && !canMute && !rights.suspend && !rights.reactivate && !rights.remove) {
    return null;
  }

  async function run(task: Promise<unknown>, action: string): Promise<void> {
    try {
      await task;
      pushToast({ tone: "success", title: memberMutationToast(action, member.full_name) });
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
      pushToast({
        tone: "error",
        title: "Thao tác thất bại",
        message: toVietnameseDashboardMessage(code),
      });
    }
  }

  function setStatus(status: "active" | "suspended", action: string): void {
    setOpen(false);
    void run(update.mutateAsync({ userId: member.user_id, input: { status } }), action);
  }

  const items: MenuAction[] = [];
  if (canMessage) {
    items.push({
      key: "message",
      label: "Nhắn tin riêng",
      Icon: FiMessageCircle,
      onSelect: () => {
        setOpen(false);
        onMessage(member.user_id);
      },
    });
  }
  if (canMute) {
    items.push(
      muted
        ? {
            key: "untimeout",
            label: "Bỏ cấm chat",
            Icon: FiVolume2,
            onSelect: () => {
              setOpen(false);
              void run(unmute.mutateAsync(member.user_id), "untimeout");
            },
          }
        : {
            key: "timeout",
            label: "Tạm cấm chat",
            Icon: FiVolumeX,
            onSelect: () => {
              setOpen(false);
              setTimingOut(true);
            },
          },
    );
  }
  if (rights.suspend) {
    items.push({
      key: "suspend",
      label: "Tạm khóa",
      Icon: FiMinusCircle,
      onSelect: () => setStatus("suspended", "suspended"),
    });
  }
  if (rights.reactivate) {
    items.push({
      key: "reactivate",
      label: "Kích hoạt",
      Icon: FiPlay,
      onSelect: () => setStatus("active", "reactivated"),
    });
  }
  if (rights.remove) {
    items.push({
      key: "remove",
      label: "Xóa khỏi tổ chức",
      Icon: FiUserX,
      danger: true,
      onSelect: () => {
        setOpen(false);
        setConfirming(true);
      },
    });
  }

  const copy = memberConfirmCopy("remove", member.full_name || "thành viên");
  return (
    <>
      <ActionMenu
        label={member.full_name}
        items={items}
        open={open}
        busy={busy}
        openUp={openUp}
        onToggle={() => setOpen((value) => !value)}
        onClose={() => setOpen(false)}
      />
      {timingOut && (
        <ChatTimeoutDialog
          name={member.full_name || "thành viên"}
          busy={mute.isPending}
          onClose={() => setTimingOut(false)}
          onConfirm={(minutes, reason) => {
            void run(
              mute.mutateAsync({ userId: member.user_id, minutes, reason }),
              "timeout",
            ).then(() => setTimingOut(false));
          }}
        />
      )}
      <ConfirmDialog
        open={confirming}
        danger
        title={copy.title}
        message={copy.message}
        confirmLabel={copy.confirmLabel}
        busyLabel={copy.busyLabel}
        busy={remove.isPending}
        onConfirm={() => {
          void run(remove.mutateAsync(member.user_id), "removed").then(() =>
            setConfirming(false),
          );
        }}
        onClose={() => !remove.isPending && setConfirming(false)}
      />
    </>
  );
}
