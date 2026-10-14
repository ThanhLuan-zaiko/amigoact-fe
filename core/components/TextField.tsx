import type { InputHTMLAttributes, ReactElement, ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  /** Keep the label for assistive tech only (e.g. the rail search pill). */
  hideLabel?: boolean;
  /** Rounded-full filled search pill (X right rail). */
  pill?: boolean;
}

export function TextField({
  label,
  error,
  hint,
  icon,
  trailing,
  id,
  required = false,
  className = "",
  hideLabel = false,
  pill = false,
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
        className={
          hideLabel
            ? "sr-only"
            : "text-sm font-medium text-zinc-900 dark:text-zinc-100"
        }
      >
        {label}
        {required && (
          <span
            aria-hidden="true"
            className="text-red-600 dark:text-red-400"
          >
            {" *"}
          </span>
        )}
      </label>
      <div className="relative">
        {icon && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute inset-y-0 flex items-center text-zinc-400 ${pill ? "left-4" : "left-3"}`}
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
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-[44px] w-full border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:text-zinc-100 dark:focus-visible:outline-zinc-400 ${
            pill
              ? "rounded-full bg-zinc-100 focus:bg-white dark:bg-zinc-900 dark:focus:bg-zinc-950"
              : "rounded-lg bg-white dark:bg-zinc-950"
          } ${icon ? (pill ? "pl-11" : "pl-9") : ""} ${trailing ? "pr-12" : ""} ${
            error
              ? "border-red-600 dark:border-red-400"
              : pill
                ? "border-zinc-100 dark:border-zinc-900"
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
