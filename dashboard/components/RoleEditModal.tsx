import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiCheck, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { pushToast } from "../../core/toast.ts";
import { useCreateOrgRole, useUpdateOrgRole } from "../members-hooks.ts";
import { sameSet } from "../members-utils.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { OrgRole } from "../members-api.ts";
import { PermissionPicker } from "./PermissionPicker.tsx";
import { RoleColorPicker } from "./RoleColorPicker.tsx";
import { RoleTemplatePicker } from "./RoleTemplatePicker.tsx";

interface RoleEditModalProps {
  orgId: string;
  // null while creating; an OrgRole while editing.
  role: OrgRole | null;
  viewerRole: string;
  viewerPermissions: string[];
  assignable: string[];
  open: boolean;
  onClose: () => void;
}

export function RoleEditModal({
  orgId,
  role,
  viewerRole,
  viewerPermissions,
  assignable,
  open,
  onClose,
}: RoleEditModalProps): ReactElement | null {
  const create = useCreateOrgRole(orgId);
  const update = useUpdateOrgRole(orgId);
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [perms, setPerms] = useState<string[]>(role?.permissions ?? []);
  const [color, setColor] = useState(role?.color ?? "");
  const [serverCode, setServerCode] = useState<string | null>(null);

  // Resync drafts whenever the dialog opens on a different role/mode.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
      setPerms(role?.permissions ?? []);
      setColor(role?.color ?? "");
      setServerCode(null);
    }
  }

  if (!open) return null;

  const isOwner = viewerRole === "owner";
  const busy = create.isPending || update.isPending;
  // Delegates may only wire permissions they already hold (subset rule).
  const lockedOut = (code: string): boolean =>
    !isOwner && !viewerPermissions.includes(code);
  const valid = perms.length > 0 && name.trim().length >= 2;
  const dirty =
    role === null ||
    name.trim() !== role.name ||
    description.trim() !== role.description ||
    color !== (role.color ?? "") ||
    !sameSet(perms, role.permissions);

  async function save(event: FormEvent): Promise<void> {
    event.preventDefault();
    setServerCode(null);
    try {
      const clean = name.trim();
      if (role === null) {
        await create.mutateAsync({
          name: clean,
          description: description.trim(),
          permissions: perms,
          color,
        });
        pushToast({ tone: "success", title: `Đã tạo vai trò ${clean}.` });
      } else {
        await update.mutateAsync({
          roleId: role.id,
          input: {
            name: clean,
            description: description.trim(),
            permissions: perms,
            color,
          },
        });
        pushToast({ tone: "success", title: `Đã cập nhật vai trò ${clean}.` });
      }
      onClose();
    } catch (error) {
      setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
    }
  }

  return (
    <Modal
      title={role === null ? "Tạo vai trò" : `Sửa vai trò ${role.name}`}
      open={open}
      onClose={onClose}
      wide
    >
      <form onSubmit={(event) => void save(event)} className="flex flex-col gap-3">
        {serverCode && (
          <ErrorState
            title="Không lưu được vai trò"
            message={toVietnameseDashboardMessage(serverCode)}
          />
        )}
        {role === null && (
          <RoleTemplatePicker
            assignable={assignable}
            isLocked={lockedOut}
            onPick={(template) => {
              setName(template.name);
              setDescription(template.description);
              setPerms(template.permissions);
              setColor(template.color === "zinc" ? "" : template.color);
            }}
          />
        )}
        <TextField
          label="Tên vai trò"
          name="role-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Điều phối sự kiện"
          hint="2-40 ký tự, không trùng vai trò có sẵn."
        />
        <TextField
          label="Mô tả"
          name="role-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Phụ trách vận hành sự kiện"
        />
        <RoleColorPicker value={color} onChange={setColor} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Quyền hạn</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {`Đã chọn ${perms.length} quyền`}
            </p>
          </div>
          <PermissionPicker
            assignable={assignable}
            selected={perms}
            isLocked={lockedOut}
            onChange={setPerms}
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Chọn ít nhất một quyền. Bạn chỉ có thể gán những quyền mình đang có.
          </p>
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
            type="submit"
            variant="primary"
            disabled={busy || !valid || !dirty}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {busy ? "Đang lưu…" : role === null ? "Tạo vai trò" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
