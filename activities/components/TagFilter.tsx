import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactElement } from "react";
import { FiChevronDown, FiHash, FiX } from "react-icons/fi";
import { useDismiss } from "../../core/dismiss.ts";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { TagFacet } from "../browse-api.ts";
import { foldText } from "../browse-utils.ts";
import { usePublicTagSearch } from "../tags-hooks.ts";

interface TagFilterProps {
  slug: string | undefined;
  name: string | undefined;
  // Tags on the current results, with counts. Opening the field lists them.
  tags: TagFacet[];
  onChange: (slug: string | undefined, name?: string) => void;
}

interface TagOption {
  slug: string;
  name: string;
  // Null for directory matches outside the current results.
  count: number | null;
}

// Single-pick tag dropdown. Focusing the field lists the tags in the current
// results. Typing narrows that list at once, and the public tag directory
// adds matches outside the results. Arrow keys and Enter pick an option.
export function TagFilter({
  slug,
  name,
  tags,
  onChange,
}: TagFilterProps): ReactElement {
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const needle = foldText(query.trim());
  const directory = usePublicTagSearch(query);

  const inResults = new Set(tags.map((tag) => tag.slug));
  const options: TagOption[] = [
    ...tags
      .filter((tag) => needle === "" || foldText(tag.name).includes(needle))
      .map((tag) => ({ slug: tag.slug, name: tag.name, count: tag.count })),
    ...(directory.data ?? [])
      .filter((tag) => !inResults.has(tag.slug))
      .map((tag) => ({ slug: tag.slug, name: tag.name, count: null })),
  ];

  useDismiss(open, rootRef, () => setOpen(false), inputRef);
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  function pick(option: TagOption | undefined): void {
    if (!option) return;
    onChange(option.slug, option.name);
    setQuery("");
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
        return;
      }
      const last = options.length - 1;
      setActive((index) =>
        event.key === "ArrowDown"
          ? Math.min(index + 1, last)
          : Math.max(index - 1, 0),
      );
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      pick(options[active >= 0 ? active : 0]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActive(-1);
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
    <div ref={rootRef} className="flex flex-col gap-2">
      <TextField
        pill
        hideLabel
        label="Lọc theo thẻ"
        placeholder="Chọn hoặc gõ tên thẻ"
        icon={<FiHash className="h-4 w-4" aria-hidden="true" />}
        trailing={
          <FiChevronDown className="mr-3 h-4 w-4 text-zinc-400" aria-hidden="true" />
        }
        value={query}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          open && active >= 0 ? `${listboxId}-opt-${active}` : undefined
        }
        ref={inputRef}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label="Danh sách thẻ"
          onMouseDown={(event) => event.preventDefault()}
          className="max-h-60 overflow-y-auto rounded-xl border border-zinc-200 p-1 dark:border-zinc-800"
        >
          {options.map((option, index) => (
            <li
              key={option.slug}
              id={`${listboxId}-opt-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(option)}
              className={`flex min-h-[40px] cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 ${
                index === active ? "bg-zinc-100 dark:bg-zinc-900" : ""
              }`}
            >
              <FiHash className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate">{option.name}</span>
              {option.count !== null && (
                <span className="tabular-nums text-xs text-zinc-500 dark:text-zinc-400">
                  {option.count}
                </span>
              )}
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
              {needle === ""
                ? "Chưa có thẻ nào trong kết quả này."
                : "Không có thẻ nào khớp."}
            </li>
          )}
          {directory.isError && needle !== "" && (
            <li role="alert" className="px-3 py-2 text-xs text-red-600 dark:text-red-400">
              Không tải thêm được gợi ý thẻ.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
