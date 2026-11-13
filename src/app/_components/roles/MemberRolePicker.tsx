"use client";

import { FiSave, FiTag } from "react-icons/fi";
import { setMemberRoles } from "@/app/_actions/roles";
import type { RoleBadge, RoleInfo } from "@/lib/roles";
import { FormMessage, SubmitButton } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { iconButton } from "../ui";
import RoleDot from "./RoleDot";

type MemberRolePickerProps = {
  slug: string;
  userId: string;
  // The roles the viewer may hand out.
  roles: RoleInfo[];
  held: RoleBadge[];
};

// A menu of checkboxes that sets all the roles of one member at once.
export default function MemberRolePicker({
  slug,
  userId,
  roles,
  held,
}: MemberRolePickerProps) {
  const { state, pending, formProps } = useAccountForm(
    setMemberRoles.bind(null, slug, userId),
    { resetOnSuccess: false },
  );
  const heldIds = new Set(held.map((role) => role.id));

  return (
    <details className="relative">
      <summary
        aria-label="Gán vai trò"
        title="Gán vai trò"
        className={`${iconButton} cursor-pointer list-none`}
      >
        <FiTag aria-hidden="true" />
      </summary>
      <form
        {...formProps}
        className="absolute right-0 z-10 mt-2 flex w-64 flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        <FormMessage state={state} />
        <div className="flex max-h-60 flex-col gap-1 overflow-y-auto">
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                name="member_roles"
                value={role.id}
                defaultChecked={heldIds.has(role.id)}
                className="h-4 w-4 accent-teal-700 dark:accent-teal-400"
              />
              <RoleDot color={role.color} />
              <span className="min-w-0 truncate text-sm">{role.name}</span>
            </label>
          ))}
        </div>
        <SubmitButton pending={pending} icon={FiSave}>
          Lưu
        </SubmitButton>
      </form>
    </details>
  );
}
