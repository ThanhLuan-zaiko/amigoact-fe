import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { expandPanel } from "../motion.ts";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  id?: string;
  name?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Styled select-only field (ARIA listbox): the trigger keeps DOM focus
// while the popup tracks an active descendant; keyboard, typeahead,
// pointer, Escape and outside-click all behave like the native select.
export function SelectField({
  label, value, onChange, options, id, name, error, hint,
  placeholder = "Chọn…", disabled = false, required = false,
  className = "",
}: SelectFieldProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeRef = useRef({ buf: "", at: 0 });
  const fieldId = id ?? `select-${label.length}-${name ?? "field"}`;
  const labelId = `${fieldId}-label`;
  const listboxId = `${fieldId}-listbox`;
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const describedBy =
    [error ? `${fieldId}-error` : "", hint ? `${fieldId}-hint` : ""]
      .filter(Boolean).join(" ") || undefined;

  function openList(downwards = true): void {
    if (disabled || options.length === 0) return;
    const fallback = downwards ? 0 : options.length - 1;
    setActive(selectedIndex >= 0 ? selectedIndex : fallback);
    setOpen(true);
  }

  function pick(index: number): void {
    if (index < 0 || index >= options.length) return;
    onChange(options[index].value);
    setOpen(false);
  }

  function jumpTo(prefix: string): void {
    const hit = options.findIndex((o) =>
      o.label.toLowerCase().startsWith(prefix.toLowerCase()));
    if (hit < 0) return;
    if (open) setActive(hit);
    else onChange(options[hit].value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    const key = event.key;
    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (open) pick(active); else openList(true);
    } else if (key === "Escape") {
      if (open) { event.preventDefault(); setOpen(false); }
    } else if (key === "Tab") {
      setOpen(false);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList(key === "ArrowDown");
      } else {
        setActive((i) => key === "ArrowDown"
          ? Math.min(i + 1, options.length - 1) : Math.max(i - 1, 0));
      }
    } else if (open && (key === "Home" || key === "End")) {
      event.preventDefault();
      setActive(key === "Home" ? 0 : options.length - 1);
    } else if (key.length === 1) {
      const now = Date.now();
      typeRef.current = now - typeRef.current.at < 600
        ? { buf: typeRef.current.buf + key, at: now }
        : { buf: key, at: now };
      jumpTo(typeRef.current.buf);
    }
  }

  useEffect(() => {
    if (open && listRef.current) expandPanel(listRef.current);
  }, [open]);

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event: PointerEvent): void {
      if (rootRef.current && !rootRef.current.contains(event.target as Node))
        setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [open]);

  const borderClass = error
    ? "border-red-600 dark:border-red-400"
    : "border-zinc-300 dark:border-zinc-700";

  return (
    <div ref={rootRef}
      className={`flex flex-col gap-1${className ? ` ${className}` : ""}`}>
      <label id={labelId}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
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
        <button
          type="button" id={fieldId} disabled={disabled}
          aria-haspopup="listbox" aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={labelId}
          aria-activedescendant={
            open && active >= 0 ? `${listboxId}-opt-${active}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          onClick={() => (open ? setOpen(false) : openList(true))}
          onKeyDown={onKeyDown}
          className={`flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-sm text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-60 dark:bg-zinc-950 dark:text-zinc-100 dark:focus-visible:outline-zinc-400 ${borderClass}`}
        >
          <span className={`min-w-0 flex-1 truncate${selected ? "" : " text-zinc-400"}`}>
            {selected?.label ?? placeholder}
          </span>
          <FiChevronDown aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform${open ? " rotate-180" : ""}`} />
        </button>
        {name !== undefined &&
          <input type="hidden" name={name} value={value} />}
        {open && (
          <ul ref={listRef} id={listboxId} role="listbox"
            aria-labelledby={labelId}
            onMouseDown={(e) => e.preventDefault()}
            className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === active;
              return (
                <li key={option.value || `empty-${index}`}
                  id={`${listboxId}-opt-${index}`}
                  role="option" aria-selected={isSelected}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => pick(index)}
                  className={`flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm${
                    isActive ? " bg-zinc-100 dark:bg-zinc-900" : ""} ${
                    isSelected
                      ? "font-medium text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300"}`}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && <FiCheck aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {hint && !error && (
        <p id={`${fieldId}-hint`}
          className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
      {error && (
        <p id={`${fieldId}-error`} role="alert"
          className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
