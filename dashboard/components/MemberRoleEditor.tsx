import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { useUpdateMember } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { memberMutationToast } from "../messages-members.tsx";
import { ADMIN_OPTION, customRoleOption, optionForRole } from "../messages-roles.tsx";
import { pushToast } from "../../core/toast.ts";
import { canGrantRole, sameSet } from "../members-utils.ts";
import type { DashboardMember, OrgRole } from "../members-api.ts";
import { RoleChoice } from "./RoleChoice.tsx";

interface MemberRoleEditorProps {
  orgId: string;
  member: DashboardMember;
  viewerRole: string;
  viewerPermissions: string[];
  viewerCeiling: number | null;
  orgRoles: OrgRole[];
  open: boolean;
  onClose: () => void;
}

export function MemberRoleEditor({
  orgId,
  member,
  viewerRole,
  viewerPermissions,
  viewerCeiling,
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
      .filter((role) =>
        canGrantRole(role, viewerRole, viewerPermissions, viewerCeiling),
      )
      .map((role) => role.name),
  );
  const locked = member.roles.filter(
    (name) => name !== "owner" && !(name === "admin" ? isOwner : grantable.has(name)),
  );
  const editable = [
    ...(isOwner ? [ADMIN_OPTION] : []),
    ...customs.filter((role) => grantable.has(role.name)).map(customRoleOption),
  ];
  const next = Array.from(new Set([...locked, ...selected]));
  const dirty = !sameSet(next, member.roles);

  function toggle(name: string): void {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  }

  async function save(): Promise<void> {
    setServerCode(null);
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
        <div role="group" aria-label="Chọn vai trò" className="flex flex-col gap-2">
          {editable.map((option) => (
            <RoleChoice
              key={option.key}
              type="checkbox"
              name="member-roles"
              option={option}
              checked={selected.includes(option.key)}
              onChange={() => toggle(option.key)}
            />
          ))}
          {locked.map((name) => (
            <RoleChoice
              key={name}
              type="checkbox"
              name="member-roles"
              option={optionForRole(name, orgRoles)}
              checked
              disabled
              lockedNote="Nằm ngoài quyền bạn có thể gán."
              onChange={() => undefined}
            />
          ))}
          {editable.length === 0 && locked.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chưa có vai trò nào để gán. Tạo vai trò trong mục quản lý vai trò.
            </p>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            icon={<FiX className="h-4 w-4" aria-hidden="true" />}
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={update.isPending || !dirty}
            onClick={() => void save()}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {update.isPending ? "Đang lưu…" : "Lưu vai trò"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
