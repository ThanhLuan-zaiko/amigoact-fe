import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { FiHash, FiX } from "react-icons/fi";
import { useDismiss } from "../../core/dismiss.ts";
import { expandPanel } from "../../core/motion.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { usePublicTagSearch } from "../tags-hooks.ts";

interface TagFilterProps {
  slug: string | undefined;
  name: string | undefined;
  onChange: (slug: string | undefined, name?: string) => void;
}

// Public /events filter: a single-pick hashtag combobox. Once a tag is
// active it renders as a removable pill next to the search box.
export function TagFilter({
  slug,
  name,
  onChange,
}: TagFilterProps): ReactElement {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listboxId = "tag-filter-listbox";
  const search = usePublicTagSearch(query);
  const options = search.data ?? [];

  useDismiss(open, rootRef, () => setOpen(false), inputRef);
  useEffect(() => {
    if (open && listRef.current) expandPanel(listRef.current);
  }, [open]);
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({
      block: "nearest",
    });
  }, [open, active]);

  function pick(index: number): void {
    const option = options[index];
    if (!option) return;
    onChange(option.slug, option.name);
    setQuery("");
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    const key = event.key;
    if (key === "Enter") {
      event.preventDefault();
      if (open && options.length > 0) {
        pick(active >= 0 ? active : 0);
      } else if (query.trim()) {
        onChange(query.trim().toLowerCase());
        setQuery("");
      }
    } else if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
      } else {
        setActive((i) =>
          key === "ArrowDown"
            ? Math.min(i + 1, options.length - 1)
            : Math.max(i - 1, 0),
        );
      }
    } else if (key === "Tab") {
      setOpen(false);
    }
  }

  if (slug !== undefined) {
    return (
      <Button
        variant="secondary"
        onClick={() => onChange(undefined)}
        icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        aria-label={`Bỏ lọc thẻ ${name ?? slug}`}
      >
        #{name ?? slug}
      </Button>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <TextField
        pill
        hideLabel
        label="Lọc theo thẻ"
        placeholder="Lọc theo thẻ…"
        icon={<FiHash className="h-4 w-4" aria-hidden="true" />}
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-activedescendant={
          open && active >= 0
            ? `${listboxId}-opt-${active}`
            : undefined
        }
        aria-autocomplete="list"
        ref={inputRef}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
      />
      {open && query.trim().length > 0 && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Gợi ý thẻ"
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[16rem] overflow-y-auto rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950"
        >
          {search.isError && (
            <li
              role="alert"
              className="px-3 py-2 text-xs text-red-600 dark:text-red-400"
            >
              Không tải được gợi ý thẻ.
            </li>
          )}
          {options.map((tag, index) => (
            <li
              key={tag.slug}
              id={`${listboxId}-opt-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(index)}
              className={`flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300${
                index === active ? " bg-zinc-100 dark:bg-zinc-900" : ""
              }`}
            >
              <FiHash className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{tag.name}</span>
            </li>
          ))}
          {search.isSuccess && options.length === 0 && (
            <li
              role="option"
              aria-selected={false}
              onClick={() => {
                onChange(query.trim().toLowerCase());
                setQuery("");
                setOpen(false);
              }}
              className="flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <FiHash className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">
                Lọc theo "{query.trim()}"
              </span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
