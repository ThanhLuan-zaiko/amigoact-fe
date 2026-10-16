import { useState, type ReactElement } from "react";
import {
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState } from "../../core/components/Feedback.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { ActivityDetailView } from "../api.ts";
import { SkillMatcher } from "./SkillMatcher.tsx";

const STAFF_ROLE_OPTIONS = [
  { value: "organizer", label: "Điều phối" },
  { value: "supervisor", label: "Giám sát" },
  { value: "supporter", label: "Hỗ trợ" },
];

interface StaffPanelProps {
  view: ActivityDetailView;
  canManage: boolean;
  onSave: (
    staff: { user_id: string; staff_role: string }[],
  ) => Promise<unknown>;
}

export function StaffPanel({
  view,
  canManage,
  onSave,
}: StaffPanelProps): ReactElement {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("supporter");
  const [error, setError] = useState("");

  const save = async (
    staff: { user_id: string; staff_role: string }[],
  ): Promise<void> => {
    setError("");
    try {
      await onSave(staff);
      setUserId("");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Lỗi.");
    }
  };

  const current = (): { user_id: string; staff_role: string }[] =>
    view.staff.map((s) => ({
      user_id: s.user_id,
      staff_role: s.staff_role,
    }));

  const add = (): Promise<void> =>
    save([...current(), { user_id: userId.trim(), staff_role: role }]);

  const pick = (id: string): Promise<void> =>
    save([...current(), { user_id: id, staff_role: role }]);

  const remove = async (id: string): Promise<void> => {
    await save(current().filter((s) => s.user_id !== id));
  };

  return (
    <section aria-label="Ban tổ chức" className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <FiUsers className="h-4 w-4" aria-hidden="true" /> Ban tổ chức
      </h4>
      {error && <ErrorState title="Lỗi" message={error} />}
      {view.staff.length === 0 ? (
        <EmptyState title="Chưa có nhân sự" message="Chưa phân công ai." />
      ) : (
        <ul className="flex flex-col gap-2">
          {view.staff.map((s) => (
            <li
              key={s.user_id}
              className="flex items-center justify-between gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {s.full_name}
                <span className="ml-2 text-xs text-zinc-500">{s.staff_role}</span>
              </p>
              {canManage && (
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Gỡ nhân sự"
                  onClick={() => void remove(s.user_id)}
                  icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
                >
                  <span className="sr-only">Gỡ</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <SkillMatcher
          orgId={view.activity.org_id}
          skills={view.skills}
          staffed={new Set(view.staff.map((s) => s.user_id))}
          onPick={pick}
        />
      )}
      {canManage && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <TextField
            label="User ID thành viên"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="uuid của thành viên"
          />
          <SelectField
            label="Vai trò"
            name="staff_role"
            value={role}
            onChange={setRole}
            options={STAFF_ROLE_OPTIONS}
          />
          <div className="self-end">
            <Button
              variant="secondary"
              onClick={() => void add()}
              disabled={userId.trim().length < 10}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              Thêm
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
