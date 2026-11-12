"use client";

import { FiFileText, FiHash, FiPlus } from "react-icons/fi";

type Row = { name: string; count: number | null };

type TagSuggestionListProps = {
  id: string;
  rows: Row[];
  active: number;
  onPick: (name: string) => void;
  onHover: (index: number) => void;
};

export function optionId(listId: string, index: number): string {
  return `${listId}-${index}`;
}

// The floating list under the tag box. Rows keep focus in the box, so the
// keyboard keeps working while the mouse picks.
export default function TagSuggestionList({
  id,
  rows,
  active,
  onPick,
  onHover,
}: TagSuggestionListProps) {
  return (
    <div
      id={id}
      role="listbox"
      aria-label="Gợi ý thẻ"
      className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-sm dark:border-slate-800 dark:bg-slate-950"
    >
      {rows.map((row, index) => (
        // biome-ignore lint/a11y/useKeyWithClickEvents: keys are handled on the combobox input.
        <div
          key={`${row.count === null ? "new" : "tag"}-${row.name}`}
          id={optionId(id, index)}
          role="option"
          tabIndex={-1}
          aria-selected={index === active}
          onMouseDown={(event) => event.preventDefault()}
          onMouseEnter={() => onHover(index)}
          onClick={() => onPick(row.name)}
          className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
            index === active
              ? "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400"
              : "text-slate-700 dark:text-slate-300"
          }`}
        >
          {row.count === null ? (
            <FiPlus aria-hidden="true" className="shrink-0" />
          ) : (
            <FiHash aria-hidden="true" className="shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate">
            {row.count === null ? `Tạo thẻ “${row.name}”` : row.name}
          </span>
          {row.count === null ? null : (
            <span
              className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400"
              title={`${row.count} bài viết`}
            >
              <FiFileText aria-hidden="true" />
              {row.count}
              <span className="sr-only"> bài viết</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
