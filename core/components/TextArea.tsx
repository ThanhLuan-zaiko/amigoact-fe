import type { ReactElement, TextareaHTMLAttributes } from "react";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  // field-sizing: content - the field grows/shrinks with its text, with
  // `rows` acting as the minimum height instead of a fixed frame.
  autoGrow?: boolean;
}

export function TextArea({
  label,
  error,
  hint,
  id,
  className = "",
  rows = 3,
  autoGrow = false,
  ...rest
}: TextAreaProps): ReactElement {
  const fieldId = id ?? `area-${label.length}-${rest.name ?? "text"}`;
  const describedBy =
    [error ? `${fieldId}-error` : "", hint ? `${fieldId}-hint` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className={`flex flex-col gap-1${className ? ` ${className}` : ""}`}>
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-brand ${
          autoGrow ? "field-sizing-content" : ""
        } ${
          error
            ? "border-red-600 dark:border-red-400"
            : "border-zinc-300 dark:border-zinc-700"
        }`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${fieldId}-error`}
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
