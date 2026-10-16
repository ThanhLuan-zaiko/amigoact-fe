import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiLock, FiShield, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useUpdateMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { memberMutationToast } from "../messages-members.tsx";
import { pushToast } from "../../core/toast.ts";
import { canGrantRole } from "../members-utils.ts";
import type { DashboardMember, OrgRole } from "../members-api.ts";

interface MemberRoleEditorProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  orgRoles: OrgRole[];
  open: boolean;
  onClose: () => void;
}

export function MemberRoleEditor({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  orgRoles,
  open,
  onClose,
}: MemberRoleEditorProps): ReactElement | null {
  const update = useUpdateMember(orgId);
  const [selected, setSelected] = useState<string[]>(member.roles);
  const [serverCode, setServerCode] = useState<string | null>(null);

  // Resync the draft every time the dialog opens on a fresh member state.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setSelected(member.roles);
      setServerCode(null);
    }
  }

  if (!open) return null;

  const isOwner = viewerRole === "owner";
  const customs = orgRoles.filter((role) => !role.is_system);
  // Roles the member holds that the viewer may not touch stay locked on.
  const grantable = new Set(
    customs
      .filter((role) => canGrantRole(role, viewerRole, viewerPermissions))
      .map((role) => role.name),
  );
  const locked = member.roles.filter(
    (name) => name !== "owner" && !(name === "admin" ? isOwner : grantable.has(name)),
  );
  const editable = [
    ...(isOwner ? ["admin"] : []),
    ...customs.filter((role) => grantable.has(role.name)).map((role) => role.name),
  ];

  function toggle(name: string): void {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  async function save(): Promise<void> {
    setServerCode(null);
    const next = Array.from(new Set([...locked, ...selected]));
    try {
      await update.mutateAsync({ userId: member.user_id, input: { roles: next } });
      pushToast({
        tone: "success",
        title: memberMutationToast("roles", member.full_name || null),
      });
      onClose();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <Modal title={`Vai trò của ${member.full_name || "thành viên"}`} open={open} onClose={onClose}>
      <div className="flex flex-col gap-3">
        {serverCode && (
          <ErrorState
            title="Không cập nhật được vai trò"
            message={toVietnameseDashboardMessage(serverCode)}
          />
        )}
        <div role="group" aria-label="Chọn vai trò" className="flex flex-wrap gap-2">
          {editable.map((name) => (
            <Button
              key={name}
              type="button"
              variant={selected.includes(name) ? "primary" : "secondary"}
              onClick={() => toggle(name)}
              aria-pressed={selected.includes(name)}
              icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
            >
              {name === "admin" ? "Quản trị viên" : name}
            </Button>
          ))}
          {locked.map((name) => (
            <Button
              key={name}
              type="button"
              variant="secondary"
              disabled
              icon={<FiLock className="h-4 w-4" aria-hidden="true" />}
            >
              {name === "admin" ? "Quản trị viên" : name}
            </Button>
          ))}
          {editable.length === 0 && locked.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chưa có vai trò nào để gán. Tạo vai trò trong mục quản lý vai trò.
            </p>
          )}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Vai trò bị khóa nằm ngoài quyền bạn có thể gán.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            disabled={update.isPending}
            onClick={() => void save()}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {update.isPending ? "Đang lưu…" : "Lưu vai trò"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Modal>
  );
}
