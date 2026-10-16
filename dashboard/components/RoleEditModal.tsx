import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { FiCheck, FiLock, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState } from "../../core/components/Feedback.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { pushToast } from "../../core/toast.ts";
import { useCreateOrgRole, useUpdateOrgRole } from "../members-hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import {
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
} from "../messages-members.tsx";
import type { OrgRole } from "../members-api.ts";

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
  const [serverCode, setServerCode] = useState<string | null>(null);

  // Resync drafts whenever the dialog opens on a different role/mode.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setName(role?.name ?? "");
      setDescription(role?.description ?? "");
      setPerms(role?.permissions ?? []);
      setServerCode(null);
    }
  }

  if (!open) return null;

  const isOwner = viewerRole === "owner";
  const busy = create.isPending || update.isPending;
  // Delegates may only wire permissions they already hold (subset rule).
  const lockedOut = (code: string): boolean =>
    !isOwner && !viewerPermissions.includes(code);
  const groups = PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    codes: group.codes.filter((code) => assignable.includes(code)),
  })).filter((group) => group.codes.length > 0);

  function toggle(code: string): void {
    setPerms((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

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
        });
        pushToast({ tone: "success", title: `Đã tạo vai trò ${clean}.` });
      } else {
        await update.mutateAsync({
          roleId: role.id,
          input: {
            name: clean,
            description: description.trim(),
            permissions: perms,
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
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Quyền hạn</p>
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {group.label}
              </p>
              <div role="group" aria-label={group.label} className="flex flex-wrap gap-2">
                {group.codes.map((code) => (
                  <Button
                    key={code}
                    type="button"
                    variant={perms.includes(code) ? "primary" : "secondary"}
                    onClick={() => toggle(code)}
                    aria-pressed={perms.includes(code)}
                    disabled={lockedOut(code)}
                    icon={
                      lockedOut(code) ? (
                        <FiLock className="h-4 w-4" aria-hidden="true" />
                      ) : undefined
                    }
                  >
                    {PERMISSION_LABELS[code] ?? code}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Chọn ít nhất một quyền. Quyền bị khóa nằm ngoài quyền hạn của bạn.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            variant="primary"
            disabled={busy || perms.length === 0 || name.trim().length < 2}
            icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
          >
            {busy ? "Đang lưu…" : role === null ? "Tạo vai trò" : "Lưu thay đổi"}
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
      </form>
    </Modal>
  );
}
