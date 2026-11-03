"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { fieldLabel, inputField } from "./ui";

export type SelectOption = { value: string; label: string; disabled?: boolean };

type SelectMenuProps = {
  label: string;
  // Sent with the form when set. The menu is not a native field, so it needs a hidden input.
  name?: string;
  defaultValue: string;
  options: SelectOption[];
  className?: string;
};

// Turns a { value: label } map, such as ORG_TYPE_LABELS, into menu options.
export function optionsFrom(labels: Record<string, string>): SelectOption[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

// Keyboard: arrows move, Enter or Space picks, Escape closes. Focus stays on the button.
export default function SelectMenu({
  label,
  name,
  defaultValue,
  options,
  className = "",
}: SelectMenuProps) {
  const id = useId();
  const buttonId = `${id}-button`;
  const listId = `${id}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const selected = options.find((option) => option.value === value);

  function optionId(index: number): string {
    return `${id}-option-${index}`;
  }

  // A press outside the menu closes it, as a native select does.
  useEffect(() => {
    if (!open) {
      return;
    }
    function closeOnOutsidePress(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  function openMenu() {
    const current = options.findIndex((option) => option.value === value);
    setHighlight(current >= 0 ? current : 0);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (!option || option.disabled) {
      return;
    }
    setValue(option.value);
    setOpen(false);
    // A mouse pick moves focus to the option, so hand it back to the button.
    buttonRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openMenu();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlight((index) => Math.min(index + 1, options.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlight((index) => Math.max(index - 1, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(highlight);
        break;
      case "Escape":
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={buttonId} className={fieldLabel}>
        {label}
      </label>
      <div ref={rootRef} className="relative">
        <button
          ref={buttonRef}
          id={buttonId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? optionId(highlight) : undefined}
          onClick={(event) => {
            // Keyboard activation is handled in onKeyDown. Only mouse clicks reach here.
            if (event.detail === 0) {
              return;
            }
            if (open) {
              setOpen(false);
            } else {
              openMenu();
            }
          }}
          onKeyDown={onKeyDown}
          className={`${inputField} flex items-center justify-between gap-2 text-left`}
        >
          <span className="truncate">{selected?.label ?? ""}</span>
          <FiChevronDown
            aria-hidden="true"
            className={`shrink-0 text-slate-500 transition-transform duration-200 ease-out motion-reduce:transition-none dark:text-slate-400 ${open ? "rotate-180" : ""}`}
          />
        </button>
        <div
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className={`absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-sm transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-900 ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlight;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the combobox button.
              <div
                key={option.value}
                id={optionId(index)}
                role="option"
                tabIndex={-1}
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onClick={() => choose(index)}
                onMouseEnter={() => setHighlight(index)}
                className={`flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm transition-colors duration-100 ${option.disabled ? "cursor-not-allowed text-slate-400 dark:text-slate-500" : "cursor-pointer text-slate-700 dark:text-slate-200"} ${isHighlighted && !option.disabled ? "bg-slate-100 dark:bg-slate-800" : ""}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected ? (
                  <FiCheck
                    aria-hidden="true"
                    className="shrink-0 text-teal-700 dark:text-teal-400"
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        {name ? <input type="hidden" name={name} value={value} /> : null}
      </div>
    </div>
  );
}
