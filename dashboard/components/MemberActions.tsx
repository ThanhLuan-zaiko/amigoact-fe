import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiMinusCircle,
  FiPlay,
  FiShield,
  FiUserMinus,
  FiUserX,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { pushToast } from "../../core/toast.ts";
import { useRemoveMember, useUpdateMember } from "../members-hooks.ts";
import { memberMutationToast, toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardMember, OrgRole } from "../members-api.ts";
import { MemberRoleEditor } from "./MemberRoleEditor.tsx";

interface MemberActionsProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  isSelf: boolean;
}

export function MemberActions({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  orgRoles,
  isSelf,
}: MemberActionsProps): ReactElement | null {
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [editingRoles, setEditingRoles] = useState(false);
  const busy = update.isPending || remove.isPending;

  const isOwner = viewerRole === "owner";
  const targetOwner = member.roles.includes("owner");
  const targetAdmin = member.roles.includes("admin");
  // Non-owners can never act on an admin; nobody acts on the owner.
  const canActOnTarget =
    !isSelf && !targetOwner && (isOwner || !targetAdmin);
  const canAssign =
    canActOnTarget &&
    member.status === "active" &&
    (isOwner || viewerPermissions.includes("member:role-assign"));
  const canSuspend =
    canActOnTarget && member.status === "active" &&
    (isOwner || viewerPermissions.includes("member:suspend"));
  const canReactivate =
    canActOnTarget && member.status === "suspended" &&
    (isOwner || viewerPermissions.includes("member:suspend"));
  const canRemove =
    canActOnTarget && member.status !== "left" &&
    (isOwner || viewerPermissions.includes("member:remove"));
  const canLeave =
    isSelf && !targetOwner && member.status !== "left" && member.status !== "invited";

  async function run(task: Promise<unknown>, action: string): Promise<void> {
    try {
      await task;
      setConfirmRemove(false);
      pushToast({
        tone: "success",
        title: memberMutationToast(action, member.full_name || null),
      });
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
      pushToast({
        tone: "error",
        title: "Thao tác thất bại",
        message: toVietnameseDashboardMessage(code),
      });
    }
  }

  if (!canAssign && !canSuspend && !canReactivate && !canRemove && !canLeave) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {canAssign && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => setEditingRoles(true)}
            icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
          >
            Vai trò
          </Button>
        )}
        {canSuspend && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { status: "suspended" } }), "suspended")}
            icon={<FiMinusCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Tạm khóa
          </Button>
        )}
        {canReactivate && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { status: "active" } }), "reactivated")}
            icon={<FiPlay className="h-4 w-4" aria-hidden="true" />}
          >
            Kích hoạt
          </Button>
        )}
        {canRemove && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (!confirmRemove) {
                setConfirmRemove(true);
                return;
              }
              run(remove.mutateAsync(member.user_id), member.status === "invited" ? "revoked" : "removed");
            }}
            aria-pressed={confirmRemove}
            icon={<FiUserX className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
            className={
              confirmRemove
                ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                : undefined
            }
          >
            {confirmRemove ? "Bấm lại để xác nhận" : member.status === "invited" ? "Thu hồi" : "Xóa"}
          </Button>
        )}
        {canLeave && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => {
              if (!confirmRemove) {
                setConfirmRemove(true);
                return;
              }
              run(remove.mutateAsync(member.user_id), "left");
            }}
            aria-pressed={confirmRemove}
            icon={<FiUserMinus className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
            className={
              confirmRemove
                ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                : undefined
            }
          >
            {confirmRemove ? "Bấm lại để rời" : "Rời tổ chức"}
          </Button>
        )}
      </div>
      <MemberRoleEditor
        orgId={orgId}
        member={member}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        orgRoles={orgRoles}
        open={editingRoles}
        onClose={() => setEditingRoles(false)}
      />
    </div>
  );
}
