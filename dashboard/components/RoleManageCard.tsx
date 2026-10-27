import { useState } from "react";
import type { ReactElement } from "react";
import { FiChevronDown, FiChevronUp, FiPlus, FiSearch, FiShield, FiX } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ConfirmDialog } from "../../core/components/ConfirmDialog.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { pushToast } from "../../core/toast.ts";
import { useDeleteOrgRole, useOrgRoles } from "../members-hooks.ts";
import { useReorderRoles } from "../roles-hooks.ts";
import { canGrantRole, hasPermission } from "../members-utils.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { filterRoles, roleDeleteCopy } from "../messages-roles.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { OrgRole } from "../members-api.ts";
import { RoleEditModal } from "./RoleEditModal.tsx";
import { RoleRow } from "./RoleRow.tsx";

interface RoleManageCardProps {
  orgId: string;
  viewerRole: string;
  viewerPermissions: string[];
  viewerCeiling: number | null;
}

// The rail is narrow: a long catalog folds behind "see more", and past
// SEARCH_MIN roles a search box lets managers jump straight to one.
const VISIBLE_ROLES = 5;
const SEARCH_MIN = 8;

export function RoleManageCard({
  orgId,
  viewerRole,
  viewerPermissions,
  viewerCeiling,
}: RoleManageCardProps): ReactElement {
  const roles = useOrgRoles(orgId);
  const remove = useDeleteOrgRole(orgId);
  const reorder = useReorderRoles(orgId);
  const [target, setTarget] = useState<OrgRole | "new" | null>(null);
  const [deleting, setDeleting] = useState<OrgRole | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");

  const canManage = hasPermission(viewerRole, viewerPermissions, "member:role-assign");
  const items = roles.data?.items ?? [];
  const searchable = items.length > SEARCH_MIN;
  const searching = searchable && search.trim() !== "";
  // A search lists every match; the fold only applies to the full catalog.
  const matches = searching ? filterRoles(items, search) : items;
  const shown = showAll || searching ? matches : matches.slice(0, VISIBLE_ROLES);
  const hidden = matches.length - VISIBLE_ROLES;
  // Seniority is the owner's call and only makes sense on the full list.
  const customs = items.filter((item) => !item.is_system);
  const canReorder = viewerRole === "owner" && !searching;

  async function move(role: OrgRole, direction: -1 | 1): Promise<void> {
    const from = customs.findIndex((item) => item.id === role.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= customs.length) return;
    const next = [...customs];
    [next[from], next[to]] = [next[to], next[from]];
    try {
      await reorder.mutateAsync(next.map((item) => item.id));
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
      pushToast({
        tone: "error",
        title: "Không đổi được thứ tự vai trò",
        message: toVietnameseDashboardMessage(code),
      });
    }
  }

  async function run(role: OrgRole): Promise<void> {
    try {
      await remove.mutateAsync(role.id);
      pushToast({ tone: "success", title: `Đã xóa vai trò ${role.name}.` });
    } catch (error) {
      const code = error instanceof ApiError ? error.code : "REQUEST_FAILED";
      pushToast({
        tone: "error",
        title: "Không xóa được vai trò",
        message: toVietnameseDashboardMessage(code),
      });
    }
    setDeleting(null);
  }

  const copy = roleDeleteCopy(deleting ?? { name: "", member_count: 0 });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FiShield className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Vai trò tùy chỉnh
          </h3>
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
        {searchable && (
          <TextField
            label="Tìm vai trò"
            hideLabel
            name="role-search"
            autoComplete="off"
            placeholder="Tìm theo tên, mô tả hoặc quyền"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
            trailing={
              search !== "" ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="cell"
                  onClick={() => setSearch("")}
                  aria-label="Xóa từ khóa tìm vai trò"
                  icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                />
              ) : undefined
            }
            className="mb-3"
          />
        )}
        {searching && matches.length === 0 && (
          <EmptyState
            title="Không có vai trò phù hợp"
            message="Thử từ khóa khác hoặc xóa từ khóa để xem toàn bộ."
            actionLabel="Xóa từ khóa"
            onAction={() => setSearch("")}
          />
        )}
        {matches.length > 0 && (
          <>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {shown.map((role) => (
                <RoleRow
                  key={role.id}
                  role={role}
                  canEdit={
                    canManage &&
                    !role.is_system &&
                    canGrantRole(role, viewerRole, viewerPermissions, viewerCeiling)
                  }
                  busy={remove.isPending || reorder.isPending}
                  onEdit={() => setTarget(role)}
                  onDelete={() => setDeleting(role)}
                  onMove={
                    canReorder && !role.is_system
                      ? (direction) => void move(role, direction)
                      : undefined
                  }
                  canMoveUp={customs[0]?.id !== role.id}
                  canMoveDown={customs[customs.length - 1]?.id !== role.id}
                />
              ))}
            </ul>
            {!searching && hidden > 0 && (
              <div className="mt-3">
                <Button
                  type="button"
                  variant="secondary"
                  aria-expanded={showAll}
                  onClick={() => setShowAll((value) => !value)}
                  icon={
                    showAll ? (
                      <FiChevronUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <FiChevronDown className="h-4 w-4" aria-hidden="true" />
                    )
                  }
                >
                  {showAll ? "Thu gọn" : `Xem thêm ${hidden} vai trò`}
                </Button>
              </div>
            )}
          </>
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
      <ConfirmDialog
        open={deleting !== null}
        danger
        title={copy.title}
        message={copy.message}
        confirmLabel={copy.confirmLabel}
        busyLabel={copy.busyLabel}
        busy={remove.isPending}
        onConfirm={() => deleting !== null && void run(deleting)}
        onClose={() => !remove.isPending && setDeleting(null)}
      />
    </>
  );
}
