import type { InputHTMLAttributes, ReactElement, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  trailing,
  id,
  className = "",
  ...rest
}: TextFieldProps): ReactElement {
  const fieldId = id ?? `field-${label.length}-${rest.name ?? "input"}`;
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
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400"
          >
            {icon}
          </span>
        )}
        {trailing && (
          <span className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </span>
        )}
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-[44px] w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-blue-400 ${
            icon ? "pl-9" : ""
          } ${trailing ? "pr-12" : ""} ${
            error
              ? "border-red-600 dark:border-red-400"
              : "border-zinc-300 dark:border-zinc-700"
          }`}
          {...rest}
        />
      </div>
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
