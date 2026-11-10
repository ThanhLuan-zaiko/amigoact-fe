"use client";

import { useId } from "react";
import { FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import type { FieldErrors } from "@/lib/account";
import { fieldLabel, inputField, inputFieldInvalid } from "../ui";
import { RequiredMark } from "./RequiredMarks";

export function FieldNotes({
  id,
  hint,
  error,
}: {
  id: string;
  hint?: string;
  error?: string;
}) {
  return (
    <>
      {hint && !error ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span
          id={id}
          className="flex items-start gap-1 text-xs font-semibold text-red-700 dark:text-red-400"
        >
          <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </span>
      ) : null}
    </>
  );
}

type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | null;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
  errors?: FieldErrors;
};

export function TextField({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  autoComplete,
  minLength,
  maxLength,
  hint,
  errors,
}: TextFieldProps) {
  const errorId = useId();
  const error = errors?.[name];
  return (
    <label className="flex flex-col gap-1">
      <span className={fieldLabel}>
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? undefined}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={error ? inputFieldInvalid : inputField}
      />
      <FieldNotes id={errorId} hint={hint} error={error} />
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  defaultValue?: string | null;
  maxLength?: number;
  hint?: string;
  errors?: FieldErrors;
};

export function TextAreaField({
  label,
  name,
  rows = 4,
  required = false,
  defaultValue,
  maxLength,
  hint,
  errors,
}: TextAreaFieldProps) {
  const errorId = useId();
  const error = errors?.[name];
  return (
    <label className="flex flex-col gap-1">
      <span className={fieldLabel}>
        {label}
        {required ? <RequiredMark /> : null}
      </span>
      <textarea
        name={name}
        required={required}
        rows={rows}
        defaultValue={defaultValue ?? undefined}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${error ? inputFieldInvalid : inputField} resize-y leading-relaxed`}
      />
      <FieldNotes id={errorId} hint={hint} error={error} />
    </label>
  );
}

type PasswordFieldProps = {
  label: string;
  name: string;
  visible: boolean;
  onToggle: () => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
  maxLength?: number;
  hint?: string;
  errors?: FieldErrors;
};

export function PasswordField({
  label,
  name,
  visible,
  onToggle,
  required = false,
  autoComplete,
  minLength,
  maxLength,
  hint,
  errors,
}: PasswordFieldProps) {
  const id = useId();
  const errorId = useId();
  const error = errors?.[name];
  const Icon = visible ? FiEyeOff : FiEye;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className={fieldLabel}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${error ? inputFieldInvalid : inputField} pr-10`}
        />
        {/* Out of the tab order, so Tab moves straight to the next field. */}
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-slate-500 transition-colors hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400"
        >
          <Icon aria-hidden="true" />
        </button>
      </div>
      <FieldNotes id={errorId} hint={hint} error={error} />
    </div>
  );
}

export { FormMessage, FormSection, SubmitButton } from "./FormChrome";
