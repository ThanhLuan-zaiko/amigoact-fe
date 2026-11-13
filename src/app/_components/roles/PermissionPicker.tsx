"use client";

import { FiCheckSquare, FiSquare } from "react-icons/fi";
import { ADMINISTRATOR, MODULES, moduleCodes, PRESETS } from "@/lib/roles";
import { chipButton, fieldLabel, mutedText } from "../ui";

type PermissionPickerProps = {
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  // Permission codes the viewer holds. Nobody hands out a permission they lack.
  grantable: string[];
  error?: string;
};

const checkbox = "mt-1 h-4 w-4 shrink-0 accent-teal-700 dark:accent-teal-400";

// Permissions grouped by module, each with its own boxes, plus ready-made sets on top.
export default function PermissionPicker({
  selected,
  onChange,
  grantable,
  error,
}: PermissionPickerProps) {
  const canGrant = (code: string) => grantable.includes(code);

  function toggle(codes: string[], on: boolean) {
    const next = new Set(selected);
    for (const code of codes.filter(canGrant)) {
      if (on) {
        next.add(code);
      } else {
        next.delete(code);
      }
    }
    onChange(next);
  }

  // A preset replaces what can be changed. What the viewer cannot change stays as it is.
  function applyPreset(codes: string[]) {
    const kept = [...selected].filter((code) => !canGrant(code));
    onChange(new Set([...kept, ...codes.filter(canGrant)]));
  }

  return (
    <div className="@container flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>Mẫu quyền</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset.codes)}
              className={chipButton}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className={mutedText}>
          Chọn một mẫu để điền sẵn, rồi bỏ hoặc thêm từng quyền bên dưới.
        </p>
      </div>
      {canGrant(ADMINISTRATOR) ? (
        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 dark:border-slate-800">
          <input
            type="checkbox"
            checked={selected.has(ADMINISTRATOR)}
            onChange={(event) => toggle([ADMINISTRATOR], event.target.checked)}
            className={checkbox}
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Quản trị viên</span>
            <span className={mutedText}>
              Có mọi quyền dưới đây, kể cả quyền thêm sau này.
            </span>
          </span>
        </label>
      ) : null}
      <div className="@xl:columns-2 @xl:gap-x-8">
        {MODULES.map((module) => {
          const codes = moduleCodes(module);
          const editable = codes.filter(canGrant);
          const allOn = editable.every((code) => selected.has(code));
          return (
            <fieldset
              key={module.id}
              className="mb-3 flex break-inside-avoid flex-col gap-1 border-t border-slate-200 pt-3 dark:border-slate-800"
            >
              <legend className="sr-only">{module.label}</legend>
              <div className="flex items-center justify-between gap-2">
                <h3 className={fieldLabel}>{module.label}</h3>
                {editable.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => toggle(codes, !allOn)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400"
                  >
                    {allOn ? (
                      <FiSquare aria-hidden="true" />
                    ) : (
                      <FiCheckSquare aria-hidden="true" />
                    )}
                    {allOn ? "Bỏ hết" : "Chọn hết"}
                  </button>
                ) : null}
              </div>
              <div className="flex flex-col gap-1">
                {module.permissions.map((permission) => (
                  <label
                    key={permission.code}
                    className="flex items-start gap-3 py-0.5 has-[:disabled]:opacity-50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(permission.code)}
                      disabled={!canGrant(permission.code)}
                      onChange={(event) =>
                        toggle([permission.code], event.target.checked)
                      }
                      className={checkbox}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="text-sm font-semibold">
                        {permission.label}
                      </span>
                      <span className={mutedText}>{permission.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}
      </div>
      {error ? (
        <p
          role="alert"
          className="text-xs font-semibold text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
