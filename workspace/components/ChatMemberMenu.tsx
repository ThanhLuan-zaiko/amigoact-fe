import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  FiMessageCircle,
  FiMinusCircle,
  FiMoreHorizontal,
  FiPlay,
  FiUserX,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { useDismiss } from "../../core/dismiss.ts";
import {
  useRemoveMember,
  useUpdateMember,
} from "../../dashboard/members-hooks.ts";
import type { DashboardMember } from "../../dashboard/members-api.ts";

const ITEM =
  "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm " +
  "text-zinc-800 transition-colors hover:bg-zinc-100 " +
  "dark:text-zinc-200 dark:hover:bg-zinc-900";

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
// suspend/reactivate/remove mirrored from /manage/members gating (same
// endpoints and member:* permission codes; org rooms are membership-
// derived so removal ejects the user from every room at once).
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
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const busy = update.isPending || remove.isPending;

  function close(): void {
    setOpen(false);
    setConfirming(false);
  }
  useDismiss(open, rootRef, close, triggerRef);

  const isOwner = viewerRole === "owner";
  const targetOwner = member.roles.includes("owner");
  const targetAdmin = member.roles.includes("admin");
  // Same rules as dashboard's MemberActions: nobody touches the owner,
  // and non-owners never act on an admin or themselves.
  const canActOnTarget =
    !isSelf && !targetOwner && (isOwner || !targetAdmin);
  const can = (code: string): boolean =>
    isOwner || viewerPermissions.includes(code);
  const canSuspend =
    canActOnTarget && member.status === "active" && can("member:suspend");
  const canRemove = canActOnTarget && can("member:remove");
  const canMessage = !isSelf;

  if (!canMessage && !canSuspend && !canRemove) return null;

  return (
    <span ref={rootRef} className="relative shrink-0">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Hành động cho ${member.full_name}`}
        icon={<FiMoreHorizontal className="h-4 w-4" aria-hidden="true" />}
      />
      {open && (
        <div
          role="menu"
          aria-label={`Hành động cho ${member.full_name}`}
          className={
            "absolute right-0 z-50 w-56 overflow-hidden rounded-xl " +
            "border border-zinc-200 bg-white py-1 dark:border-zinc-800 " +
            "dark:bg-zinc-950 " +
            (openUp ? "bottom-full mb-1" : "top-full mt-1")
          }
        >
          {canMessage && (
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              className={ITEM}
              onClick={() => {
                close();
                onMessage(member.user_id);
              }}
            >
              <FiMessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Nhắn tin riêng
            </button>
          )}
          {canSuspend && (
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              className={ITEM}
              onClick={() => {
                close();
                update.mutate({
                  userId: member.user_id,
                  input: { status: "suspended" },
                });
              }}
            >
              <FiMinusCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Tạm khóa
            </button>
          )}
          {canActOnTarget &&
            member.status === "suspended" &&
            can("member:suspend") && (
              <button
                type="button"
                role="menuitem"
                disabled={busy}
                className={ITEM}
                onClick={() => {
                  close();
                  update.mutate({
                    userId: member.user_id,
                    input: { status: "active" },
                  });
                }}
              >
                <FiPlay className="h-4 w-4 shrink-0" aria-hidden="true" />
                Kích hoạt
              </button>
            )}
          {canRemove && (
            <button
              type="button"
              role="menuitem"
              disabled={busy}
              className={`${ITEM} text-red-600 dark:text-red-400`}
              onClick={() => {
                if (!confirming) {
                  setConfirming(true);
                  return;
                }
                close();
                remove.mutate(member.user_id);
              }}
            >
              <FiUserX className="h-4 w-4 shrink-0" aria-hidden="true" />
              {confirming ? "Bấm lại để xác nhận" : "Xóa khỏi tổ chức"}
            </button>
          )}
        </div>
      )}
    </span>
  );
}
