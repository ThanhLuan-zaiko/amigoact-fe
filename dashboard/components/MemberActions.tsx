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
import { ErrorState } from "../../core/components/Feedback.tsx";
import { useRemoveMember, useUpdateMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardMember, MemberRole } from "../api.ts";

interface MemberActionsProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: MemberRole;
  isSelf: boolean;
}

export function MemberActions({
  orgId,
  member,
  viewerRole,
  isSelf,
}: MemberActionsProps): ReactElement | null {
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const busy = update.isPending || remove.isPending;

  const manager = viewerRole === "owner" || viewerRole === "admin";
  // Admins only act on plain members; owners act on admins and members too.
  const canActOnTarget =
    manager && !isSelf && member.role !== "owner" &&
    (viewerRole === "owner" || member.role === "member");
  const canAssign = viewerRole === "owner" && !isSelf && member.status === "active";
  const canSuspend = canActOnTarget && member.status === "active";
  const canReactivate = canActOnTarget && member.status === "suspended";
  const canRemove = canActOnTarget && member.status !== "left";
  const canLeave =
    isSelf && member.role !== "owner" && member.status !== "left" && member.status !== "invited";

  async function run(task: Promise<unknown>): Promise<void> {
    setServerCode(null);
    try {
      await task;
      setConfirmRemove(false);
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  if (!canAssign && !canSuspend && !canReactivate && !canRemove && !canLeave) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {canAssign && member.role === "member" && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { role: "admin" } }))}
            icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
          >
            Gán admin
          </Button>
        )}
        {canAssign && member.role === "admin" && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { role: "member" } }))}
            icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
          >
            Hạ thành viên
          </Button>
        )}
        {canSuspend && (
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { status: "suspended" } }))}
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
            onClick={() => run(update.mutateAsync({ userId: member.user_id, input: { status: "active" } }))}
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
              run(remove.mutateAsync(member.user_id));
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
              run(remove.mutateAsync(member.user_id));
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
      {serverCode && (
        <ErrorState
          title="Thao tác thất bại"
          message={toVietnameseDashboardMessage(serverCode)}
        />
      )}
    </div>
  );
}
