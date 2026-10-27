import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { pushToast } from "../../core/toast.ts";
import { useOrgRoles } from "../members-hooks.ts";
import { useSetMemberDefaults } from "../roles-hooks.ts";
import { sameSet } from "../members-utils.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import { permissionLabel } from "../messages-roles.tsx";
import { PermissionPicker } from "./PermissionPicker.tsx";

interface MemberDefaultsCardProps {
  orgId: string;
  viewerRole: string;
}

// Baseline every active member holds on top of their roles. Anyone in the
// org can read it; only the owner edits it.
export function MemberDefaultsCard({
  orgId,
  viewerRole,
}: MemberDefaultsCardProps): ReactElement {
  const roles = useOrgRoles(orgId);
  const save = useSetMemberDefaults(orgId);
  const [draft, setDraft] = useState<string[] | null>(null);
  const isOwner = viewerRole === "owner";
  const saved = roles.data?.member_defaults ?? [];
  const selected = draft ?? saved;
  const dirty = draft !== null && !sameSet(draft, saved);

  async function submit(): Promise<void> {
    try {
      await save.mutateAsync(selected);
      setDraft(null);
      pushToast({ tone: "success", title: "Đã cập nhật quyền mặc định của thành viên." });
    } catch (error) {
      pushToast({
        tone: "error",
        title: "Không lưu được quyền mặc định",
        message: toVietnameseDashboardMessage(
          error instanceof ApiError ? error.code : "REQUEST_FAILED",
        ),
      });
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <FiUsers className="h-5 w-5 text-zinc-900 dark:text-zinc-100" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Quyền mặc định của thành viên
        </h3>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Mọi thành viên đang hoạt động đều có các quyền này, cộng thêm quyền từ vai trò của họ.
      </p>
      <div className="mt-3" aria-live="polite" aria-busy={roles.isPending}>
        {roles.isPending && <LoadingState label="Đang tải quyền mặc định…" />}
        {roles.isError && (
          <ErrorState
            title="Không tải được quyền mặc định"
            message={toVietnameseDashboardMessage(
              roles.error instanceof ApiError ? roles.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {roles.data && isOwner && (
          <div className="flex flex-col gap-3">
            <PermissionPicker
              assignable={roles.data.baseline_permissions}
              selected={selected}
              isLocked={() => false}
              onChange={setDraft}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                disabled={!dirty || save.isPending}
                onClick={() => void submit()}
                icon={<FiCheck className="h-4 w-4" aria-hidden="true" />}
              >
                {save.isPending ? "Đang lưu…" : "Lưu quyền mặc định"}
              </Button>
            </div>
          </div>
        )}
        {roles.data && !isOwner && (
          <ul className="flex flex-wrap gap-1.5">
            {saved.length === 0 && (
              <li className="text-xs text-zinc-500 dark:text-zinc-400">
                Thành viên thường chưa có quyền bổ sung nào.
              </li>
            )}
            {saved.map((code) => (
              <li
                key={code}
                className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
              >
                {permissionLabel(code)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
