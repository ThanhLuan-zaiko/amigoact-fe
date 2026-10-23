import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  KeyboardEvent,
  ReactElement,
} from "react";
import { FiHash, FiPlus, FiX } from "react-icons/fi";
import { useDismiss } from "../dismiss.ts";
import { foldTag } from "../tag-fold.ts";

export interface TagSuggestion {
  name: string;
  slug: string;
  detail?: string;
}

interface TagFieldProps {
  label?: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: TagSuggestion[];
  suggestionsError?: boolean;
  max?: number;
  disabled?: boolean;
  hint?: string;
}

interface Option {
  key: string;
  name: string;
  create: boolean;
  detail?: string;
}

// Free-form hashtag picker. Callers pass the suggestion list; unknown
// names become a trailing create option and are claimed when the form saves.
export function TagField({
  label = "Thẻ",
  value,
  onChange,
  suggestions,
  suggestionsError = false,
  max = 10,
  disabled = false,
  hint,
}: TagFieldProps): ReactElement {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const fieldId = `tag-field-${label.length}`;
  const listboxId = `${fieldId}-listbox`;
  const taken = new Set(value.map(foldTag));
  const full = value.length >= max;
  const trimmed = query.trim();
  const needle = foldTag(trimmed);
  const matches = suggestions
    .filter(
      (tag) =>
        !needle ||
        foldTag(tag.name).includes(needle) ||
        tag.slug.includes(needle),
    )
    .filter((tag) => !taken.has(foldTag(tag.name)));
  const exact = matches.some((tag) => foldTag(tag.name) === needle);
  const options: Option[] = [
    ...matches.slice(0, 8).map((tag) => ({
      key: `${tag.slug}:${tag.name}`,
      name: tag.name,
      create: false,
      detail: tag.detail,
    })),
    ...(trimmed && !exact
      ? [{ key: "__create__", name: trimmed, create: true }]
      : []),
  ];

  useDismiss(open, rootRef, () => setOpen(false), inputRef);
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function add(name: string): void {
    const next = name.trim();
    if (!next || taken.has(foldTag(next)) || full) return;
    onChange([...value, next]);
    setQuery("");
    setActive(-1);
  }

  function remove(name: string): void {
    onChange(value.filter((tag) => tag !== name));
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    const key = event.key;
    if (key === "Enter") {
      event.preventDefault();
      if (open && active >= 0 && active < options.length) {
        add(options[active].name);
      } else {
        add(trimmed);
      }
      setOpen(false);
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(key === "ArrowDown" ? 0 : options.length - 1);
      } else {
        setActive((index) =>
          key === "ArrowDown"
            ? Math.min(index + 1, options.length - 1)
            : Math.max(index - 1, 0),
        );
      }
    } else if (key === "Backspace" && !query && value.length > 0) {
      onChange(value.slice(0, -1));
    } else if (key === "Tab") {
      setOpen(false);
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    setActive(-1);
    setOpen(true);
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-1">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`flex min-h-[44px] w-full flex-wrap items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:outline-zinc-400${disabled ? " opacity-60" : ""}`}
        >
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-zinc-100 py-0.5 pr-1 pl-2.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <FiHash className="h-3 w-3" aria-hidden="true" />
              {tag}
              <button
                type="button"
                onClick={() => remove(tag)}
                disabled={disabled}
                aria-label={`Xoá thẻ ${tag}`}
                className="flex h-5 w-5 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:focus-visible:outline-zinc-400"
              >
                <FiX className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={fieldId}
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? listboxId : undefined}
            aria-activedescendant={
              open && active >= 0 ? `${listboxId}-opt-${active}` : undefined
            }
            aria-autocomplete="list"
            value={query}
            onChange={onInput}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            disabled={disabled || full}
            placeholder={
              value.length === 0 ? "Gõ rồi Enter để thêm thẻ…" : "Thêm thẻ…"
            }
            className="min-w-[8rem] flex-1 border-0 bg-transparent px-1 py-1 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-zinc-500 disabled:cursor-not-allowed dark:text-zinc-100 dark:focus-visible:outline-zinc-400"
          />
        </div>
        {open && options.length > 0 && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Gợi ý thẻ"
            onMouseDown={(event) => event.preventDefault()}
            className="absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
          >
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${listboxId}-opt-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseEnter={() => setActive(index)}
                onClick={() => {
                  add(option.name);
                  setOpen(false);
                }}
                className={`flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300${
                  index === active ? " bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
              >
                {option.create ? (
                  <FiPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <FiHash className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  {option.create ? `Thêm "${option.name}"` : option.name}
                </span>
                {option.detail && (
                  <span className="max-w-[45%] shrink-0 truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {option.detail}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {suggestionsError && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          Không tải được gợi ý thẻ. Vẫn có thể nhập thẻ mới.
        </p>
      )}
      {hint && !suggestionsError && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
