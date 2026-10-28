import { useState } from "react";
import type { ReactElement } from "react";
import {
  FiFileText,
  FiMinusCircle,
  FiPlay,
  FiShield,
  FiUserCheck,
  FiUserMinus,
  FiUserX,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { ActionMenu } from "../../core/components/ActionMenu.tsx";
import type { MenuAction } from "../../core/components/ActionMenu.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { pushToast } from "../../core/toast.ts";
import { useApproveMember, useRejectMember } from "../application-hooks.ts";
import { useRemoveMember, useRevokeInvitation, useUpdateMember } from "../members-hooks.ts";
import { hasAnyRight, memberRights } from "../members-utils.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { memberMutationToast } from "../messages-members.tsx";
import { CONFIRM_ACTIONS, memberConfirmCopy } from "../messages-roles.tsx";
import type { MemberConfirmKind } from "../messages-roles.tsx";
import type { DashboardMember, OrgRole } from "../members-api.ts";
import { MemberApplicationDialog } from "./MemberApplicationDialog.tsx";
import { MemberRoleEditor } from "./MemberRoleEditor.tsx";

interface MemberActionsProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  viewerCeiling: number | null;
  orgRoles: OrgRole[];
  isSelf: boolean;
  // Present only when the viewer may open this member's volunteer profile.
  onViewProfile?: () => void;
}

export function MemberActions({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  viewerCeiling,
  orgRoles,
  isSelf,
  onViewProfile,
}: MemberActionsProps): ReactElement | null {
  const update = useUpdateMember(orgId);
  const remove = useRemoveMember(orgId);
  const revoke = useRevokeInvitation(orgId);
  const approve = useApproveMember(orgId);
  const reject = useRejectMember(orgId);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<MemberConfirmKind | null>(null);
  const [editingRoles, setEditingRoles] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(false);
  const busy = update.isPending || remove.isPending || revoke.isPending || approve.isPending || reject.isPending;

  const rights = memberRights(viewerRole, viewerPermissions, member, isSelf);
  if (!hasAnyRight(rights) && onViewProfile === undefined) return null;

  const name = member.full_name || "thành viên";

  async function run(task: Promise<unknown>, action: string): Promise<void> {
    try {
      await task;
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

  function updateStatus(status: "active" | "suspended", action: string): void {
    setOpen(false);
    void run(
      update.mutateAsync({ userId: member.user_id, input: { status } }),
      action,
    );
  }

  // Destructive entries open a confirm dialog instead of acting at once.
  function ask(kind: MemberConfirmKind): void {
    setOpen(false);
    setConfirm(kind);
  }

  async function confirmed(kind: MemberConfirmKind): Promise<void> {
    const task =
      kind === "revoke"
        ? revoke.mutateAsync(member.user_id)
        : kind === "reject"
          ? reject.mutateAsync(member.user_id)
          : remove.mutateAsync(member.user_id);
    await run(task, CONFIRM_ACTIONS[kind]);
    setConfirm(null);
  }

  const items: MenuAction[] = [];
  if (onViewProfile) {
    items.push({
      key: "profile",
      label: "Xem hồ sơ tình nguyện",
      Icon: FiFileText,
      onSelect: () => {
        setOpen(false);
        onViewProfile();
      },
    });
  }
  if (rights.assign) {
    items.push({
      key: "roles",
      label: "Vai trò",
      Icon: FiShield,
      onSelect: () => {
        setOpen(false);
        setEditingRoles(true);
      },
    });
  }
  if (rights.suspend) {
    items.push({
      key: "suspend",
      label: "Tạm khóa",
      Icon: FiMinusCircle,
      onSelect: () => updateStatus("suspended", "suspended"),
    });
  }
  if (rights.reactivate) {
    items.push({
      key: "reactivate",
      label: "Kích hoạt",
      Icon: FiPlay,
      onSelect: () => updateStatus("active", "reactivated"),
    });
  }
  if (rights.revoke) {
    items.push({
      key: "revoke",
      label: "Thu hồi lời mời",
      Icon: FiUserX,
      danger: true,
      onSelect: () => ask("revoke"),
    });
  }
  if (rights.application) {
    items.push({
      key: "application",
      label: "Xem hồ sơ nộp",
      Icon: FiFileText,
      onSelect: () => {
        setOpen(false);
        setViewingApplication(true);
      },
    });
  }
  if (rights.approve) {
    items.push({
      key: "approve",
      label: "Duyệt hồ sơ",
      Icon: FiUserCheck,
      onSelect: () => {
        setOpen(false);
        void run(approve.mutateAsync(member.user_id), "approved");
      },
    });
  }
  if (rights.reject) {
    items.push({
      key: "reject",
      label: "Từ chối hồ sơ",
      Icon: FiUserX,
      danger: true,
      onSelect: () => ask("reject"),
    });
  }
  if (rights.remove) {
    items.push({
      key: "remove",
      label: "Xóa khỏi tổ chức",
      Icon: FiUserX,
      danger: true,
      onSelect: () => ask("remove"),
    });
  }
  if (rights.leave) {
    items.push({
      key: "leave",
      label: member.status === "applied" ? "Rút hồ sơ" : "Rời tổ chức",
      Icon: FiUserMinus,
      danger: true,
      onSelect: () => ask(member.status === "applied" ? "withdraw" : "leave"),
    });
  }

  const copy = memberConfirmCopy(confirm ?? "remove", name);
  return (
    <>
      <ActionMenu
        label={name}
        items={items}
        open={open}
        busy={busy}
        onToggle={() => setOpen(!open)}
        onClose={() => setOpen(false)}
      />
      <MemberRoleEditor
        orgId={orgId}
        member={member}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        viewerCeiling={viewerCeiling}
        orgRoles={orgRoles}
        open={editingRoles}
        onClose={() => setEditingRoles(false)}
      />
      {viewingApplication && (
        <MemberApplicationDialog
          orgId={orgId}
          member={member}
          onClose={() => setViewingApplication(false)}
        />
      )}
      <ConfirmDialog
        open={confirm !== null}
        danger
        title={copy.title}
        message={copy.message}
        confirmLabel={copy.confirmLabel}
        busyLabel={copy.busyLabel}
        busy={busy}
        onConfirm={() => confirm !== null && void confirmed(confirm)}
        onClose={() => !busy && setConfirm(null)}
      />
    </>
  );
}
