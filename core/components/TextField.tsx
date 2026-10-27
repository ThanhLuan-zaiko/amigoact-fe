import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
} from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
  ref?: Ref<HTMLInputElement>;
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
  ref,
  ...rest
}: TextFieldProps): ReactElement {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
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
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-[44px] w-full border px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100 ${
            pill
              ? "rounded-full bg-white outline-none focus-visible:border-zinc-500 dark:bg-zinc-950 dark:focus-visible:border-zinc-400"
              : "rounded-lg bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:bg-zinc-950 dark:focus-visible:outline-zinc-400"
          } ${icon ? (pill ? "pl-11" : "pl-9") : ""} ${trailing ? "pr-12" : ""} ${
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
