import { useState } from "react";
import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import {
  FiMinusCircle,
  FiPlay,
  FiShield,
  FiUserMinus,
  FiUserX,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { pushToast } from "../../core/toast.ts";
import { useRemoveMember, useRevokeInvitation, useUpdateMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { memberMutationToast } from "../messages-members.tsx";
import type { DashboardMember, OrgRole } from "../members-api.ts";
import { MemberMenu } from "./MemberMenu.tsx";
import type { MenuAction } from "./MemberMenu.tsx";
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
  const revoke = useRevokeInvitation(orgId);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const busy = update.isPending || remove.isPending || revoke.isPending;

  // Every close path disarms the destructive confirm, so a reopened menu
  // never shows a stale "press again" entry that deletes in one click.
  function setMenuOpen(next: boolean): void {
    setOpen(next);
    if (!next) setConfirming(null);
  }

  const isOwner = viewerRole === "owner";
  const targetOwner = member.roles.includes("owner");
  const targetAdmin = member.roles.includes("admin");
  // Non-owners can never act on an admin; nobody acts on the owner.
  const canActOnTarget =
    !isSelf && !targetOwner && (isOwner || !targetAdmin);
  const can = (code: string): boolean =>
    isOwner || viewerPermissions.includes(code);
  const canAssign =
    canActOnTarget && member.status === "active" && can("member:role-assign");
  const canSuspend =
    canActOnTarget && member.status === "active" && can("member:suspend");
  const canReactivate =
    canActOnTarget && member.status === "suspended" && can("member:suspend");
  // Invites are withdrawn through the dedicated invitation endpoint, so
  // revocation rides on member:invite; member:remove stays for real members.
  const canRevoke =
    canActOnTarget && member.status === "invited" && can("member:invite");
  const canRemove =
    canActOnTarget &&
    (member.status === "active" || member.status === "suspended") &&
    can("member:remove");
  const canLeave =
    isSelf &&
    !targetOwner &&
    member.status !== "left" &&
    member.status !== "invited" &&
    member.status !== "revoked";

  async function run(task: Promise<unknown>, action: string): Promise<void> {
    try {
      await task;
      setConfirming(null);
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

  if (
    !canAssign &&
    !canSuspend &&
    !canReactivate &&
    !canRevoke &&
    !canRemove &&
    !canLeave
  ) {
    return null;
  }

  function updateStatus(status: "active" | "suspended", action: string): void {
    setMenuOpen(false);
    void run(
      update.mutateAsync({ userId: member.user_id, input: { status } }),
      action,
    );
  }

  // Destructive entries arm on the first press and fire on the second,
  // keeping the confirm step inside the menu.
  function destructive(
    key: string,
    idleLabel: string,
    armedLabel: string,
    Icon: IconType,
    action: string,
    act: () => Promise<unknown>,
  ): MenuAction {
    const armed = confirming === key;
    return {
      key,
      Icon,
      danger: true,
      armed,
      label: armed ? armedLabel : idleLabel,
      onSelect: () => {
        if (!armed) {
          setConfirming(key);
          return;
        }
        setMenuOpen(false);
        void run(act(), action);
      },
    };
  }

  const items: MenuAction[] = [];
  if (canAssign) {
    items.push({
      key: "roles",
      label: "Vai trò",
      Icon: FiShield,
      onSelect: () => {
        setMenuOpen(false);
        setEditingRoles(true);
      },
    });
  }
  if (canSuspend) {
    items.push({
      key: "suspend",
      label: "Tạm khóa",
      Icon: FiMinusCircle,
      onSelect: () => updateStatus("suspended", "suspended"),
    });
  }
  if (canReactivate) {
    items.push({
      key: "reactivate",
      label: "Kích hoạt",
      Icon: FiPlay,
      onSelect: () => updateStatus("active", "reactivated"),
    });
  }
  if (canRevoke) {
    items.push(
      destructive(
        "revoke",
        "Thu hồi lời mời",
        "Bấm lại để xác nhận",
        FiUserX,
        "revoked",
        () => revoke.mutateAsync(member.user_id),
      ),
    );
  }
  if (canRemove) {
    items.push(
      destructive("remove", "Xóa", "Bấm lại để xác nhận", FiUserX, "removed", () =>
        remove.mutateAsync(member.user_id),
      ),
    );
  }
  if (canLeave) {
    items.push(
      destructive(
        "leave",
        "Rời tổ chức",
        "Bấm lại để rời",
        FiUserMinus,
        "left",
        () => remove.mutateAsync(member.user_id),
      ),
    );
  }

  return (
    <>
      <MemberMenu
        label={member.full_name || "thành viên"}
        items={items}
        open={open}
        busy={busy}
        onToggle={() => setMenuOpen(!open)}
        onClose={() => setMenuOpen(false)}
      />
      <MemberRoleEditor
        orgId={orgId}
        member={member}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        orgRoles={orgRoles}
        open={editingRoles}
        onClose={() => setEditingRoles(false)}
      />
    </>
  );
}
