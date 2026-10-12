import { useState } from "react";
import type { ReactElement } from "react";
import { FiEdit2, FiPlus, FiShield, FiTrash2, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { pushToast } from "../../core/toast.ts";
import { useDeleteOrgRole, useOrgRoles } from "../members-hooks.ts";
import { canGrantRole } from "../members-utils.ts";
import {
  PERMISSION_LABELS,
  toVietnameseDashboardMessage,
} from "../messages.tsx";
import type { OrgRole } from "../members-api.ts";
import { RoleEditModal } from "./RoleEditModal.tsx";

interface RoleManageCardProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
}

export function RoleManageCard({
  orgId,
  viewerRole,
  viewerPermissions,
}: RoleManageCardProps): ReactElement {
  const roles = useOrgRoles(orgId);
  const remove = useDeleteOrgRole(orgId);
  const [target, setTarget] = useState<OrgRole | "new" | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const isOwner = viewerRole === "owner";
  const canManage = isOwner || viewerPermissions.includes("member:role-assign");
  const items = roles.data?.items ?? [];

  async function run(role: OrgRole): Promise<void> {
    try {
      await remove.mutateAsync(role.id);
      setConfirmId(null);
      pushToast({ tone: "success", title: `Đã xóa vai trò ${role.name}.` });
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
      pushToast({
        tone: "error",
        title: "Không xóa được vai trò",
        message: toVietnameseDashboardMessage(code),
      });
    }
  }

  return (
    <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <div data-rise className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FiShield className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
            Vai trò tùy chỉnh
          </h4>
        </div>
        {canManage && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setTarget("new")}
            icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
          >
            Tạo vai trò
          </Button>
        )}
      </div>
      <div className="mt-3" aria-live="polite" aria-busy={roles.isPending}>
        {roles.isPending && <LoadingState label="Đang tải vai trò…" />}
        {roles.isError && (
          <ErrorState
            title="Không tải được vai trò"
            message={toVietnameseDashboardMessage(
              roles.error instanceof ApiError ? roles.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {roles.data && items.every((item) => item.is_system) && (
          <EmptyState
            title="Chưa có vai trò tùy chỉnh"
            message="Tạo vai trò như Điều phối sự kiện hay Quản lý tệp để phân quyền chi tiết hơn cho thành viên."
          />
        )}
        {items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {items.map((role) => (
              <li
                key={role.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {role.is_system ? "Quản trị viên" : role.name}
                    </p>
                    <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                      <FiUsers className="mr-1 inline h-3 w-3" aria-hidden="true" />
                      {role.member_count}
                    </span>
                  </div>
                  {canManage &&
                    !role.is_system &&
                    canGrantRole(role, viewerRole, viewerPermissions) && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={remove.isPending}
                        onClick={() => setTarget(role)}
                        icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}
                      >
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={remove.isPending}
                        onClick={() => {
                          if (confirmId !== role.id) {
                            setConfirmId(role.id);
                            return;
                          }
                          void run(role);
                        }}
                        aria-pressed={confirmId === role.id}
                        icon={<FiTrash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
                        className={
                          confirmId === role.id
                            ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                            : undefined
                        }
                      >
                        {confirmId === role.id ? "Bấm lại để xóa" : "Xóa"}
                      </Button>
                    </div>
                  )}
                </div>
                {role.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{role.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map((code) => (
                    <span
                      key={code}
                      className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                    >
                      {PERMISSION_LABELS[code] ?? code}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <RoleEditModal
        orgId={orgId}
        role={target === "new" ? null : target}
        viewerRole={viewerRole}
        viewerPermissions={viewerPermissions}
        assignable={roles.data?.assignable_permissions ?? []}
        open={target !== null}
        onClose={() => setTarget(null)}
      />
    </div>
  );
}
