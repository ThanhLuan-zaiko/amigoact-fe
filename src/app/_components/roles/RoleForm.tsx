"use client";

import { useEffect, useState } from "react";
import { FiSave } from "react-icons/fi";
import type { FormState } from "@/lib/account";
import { ROLE_COLORS, type RoleInfo } from "@/lib/roles";
import { FormMessage, SubmitButton, TextField } from "../account/FormParts";
import { useAccountForm } from "../account/useAccountForm";
import { fieldLabel } from "../ui";
import PermissionPicker from "./PermissionPicker";

type RoleFormProps = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  // Present when editing. Without it the form creates a new role.
  role?: RoleInfo;
  // Permission codes the viewer holds. Nobody can hand out a permission they lack.
  grantable: string[];
  submitLabel: string;
};

export default function RoleForm({
  action,
  role,
  grantable,
  submitLabel,
}: RoleFormProps) {
  const { state, pending, formProps } = useAccountForm(action, {
    resetOnSuccess: !role,
  });
  const [selected, setSelected] = useState(
    () => new Set(role?.permissions ?? []),
  );
  // A new role starts empty again once it is saved.
  const saved = state.success;
  useEffect(() => {
    if (saved && !role) {
      setSelected(new Set());
    }
  }, [saved, role]);
  const colorError = state.fieldErrors?.role_color;

  return (
    <form {...formProps} className="@container flex flex-col gap-4">
      <FormMessage state={state} />
      <div className="grid grid-cols-1 items-start gap-4 @xl:grid-cols-2">
        <TextField
          label="Tên vai trò"
          name="role_name"
          defaultValue={role?.name}
          maxLength={50}
          errors={state.fieldErrors}
          required
        />
        <fieldset className="flex flex-col gap-2">
          <legend className={fieldLabel}>Màu</legend>
          <div className="flex flex-wrap gap-2">
            {ROLE_COLORS.map((color) => (
              <label
                key={color.value}
                title={color.label}
                className="inline-flex cursor-pointer items-center rounded-md border border-slate-200 p-2 has-[:checked]:border-teal-700 dark:border-slate-800 dark:has-[:checked]:border-teal-400"
              >
                <input
                  type="radio"
                  name="role_color"
                  value={color.value}
                  defaultChecked={(role?.color ?? "") === color.value}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`h-4 w-4 rounded-full ${color.dot}`}
                />
                <span className="sr-only">{color.label}</span>
              </label>
            ))}
          </div>
          {colorError ? (
            <p
              role="alert"
              className="text-xs font-semibold text-red-700 dark:text-red-400"
            >
              {colorError}
            </p>
          ) : null}
        </fieldset>
      </div>
      <PermissionPicker
        selected={selected}
        onChange={setSelected}
        grantable={grantable}
        error={state.fieldErrors?.role_permissions}
      />
      {/* Hidden inputs carry the choice, so one the viewer cannot change is still sent. */}
      {[...selected].map((code) => (
        <input key={code} type="hidden" name="role_permissions" value={code} />
      ))}
      <div>
        <SubmitButton pending={pending} icon={FiSave}>
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
