"use client";

import { type KeyboardEvent, useId, useRef, useState } from "react";
import { FiTag, FiX } from "react-icons/fi";
import { TAG_LIMIT, TAG_NAME_MAX } from "@/lib/posts";
import {
  addTag,
  suggestionRows,
  tagFieldValue,
  takeFinishedTags,
} from "@/lib/tagInput";
import { fieldLabel, mutedText } from "../ui";
import TagSuggestionList, { optionId } from "./TagSuggestionList";
import type { TagSource } from "@/app/_actions/postTags";
import { useTagSuggestions } from "./useTagSuggestions";

type TagInputProps = {
  orgSlug: string;
  // Which tags to suggest, and the form field the list is sent in.
  source?: TagSource;
  name?: string;
  initial?: string[];
  error?: string;
};

// Tags as chips. Enter or a comma turns the text into a chip, Backspace in an
// empty box removes the last one, and tags already used in the organization are
// suggested while typing. The form reads the hidden post_tags field.
export default function TagInput({
  orgSlug,
  source = "post",
  name = "post_tags",
  initial,
  error,
}: TagInputProps) {
  const [tags, setTags] = useState<string[]>(initial ?? []);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const hintId = `${baseId}-hint`;
  const full = tags.length >= TAG_LIMIT;
  const suggestions = useTagSuggestions(orgSlug, source, draft, open && !full);
  const rows = open && !full ? suggestionRows(suggestions, tags, draft) : [];
  const shownActive = active < rows.length ? active : -1;

  function commit(name: string) {
    setTags((current) => addTag(current, name));
    setDraft("");
    setActive(-1);
  }

  function remove(index: number) {
    setTags((current) => current.filter((_, at) => at !== index));
    inputRef.current?.focus();
  }

  function onChange(text: string) {
    if (text.includes(",")) {
      const next = takeFinishedTags(tags, text);
      setTags(next.tags);
      setDraft(next.draft);
    } else {
      setDraft(full ? "" : text);
    }
    setActive(-1);
    setOpen(true);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      // Enter in this box never submits the post.
      event.preventDefault();
      const picked = rows[shownActive];
      if (picked) {
        commit(picked.name);
      } else if (draft.trim()) {
        commit(draft);
      }
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      event.preventDefault();
      setTags((current) => current.slice(0, -1));
    } else if (event.key === "ArrowDown" && rows.length > 0) {
      event.preventDefault();
      setActive((shownActive + 1) % rows.length);
    } else if (event.key === "ArrowUp" && rows.length > 0) {
      event.preventDefault();
      setActive(shownActive <= 0 ? rows.length - 1 : shownActive - 1);
    } else if (event.key === "Escape" && rows.length > 0) {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={inputId}
          className={`${fieldLabel} inline-flex items-center gap-2`}
        >
          <FiTag aria-hidden="true" />
          Thẻ
        </label>
        <span className={`${mutedText} text-xs`} aria-live="polite">
          {tags.length}/{TAG_LIMIT}
        </span>
      </div>
      <input type="hidden" name={name} value={tagFieldValue(tags, draft)} />
      <div className="relative">
        <div
          className={`flex min-h-11 w-full flex-wrap items-center gap-2 rounded-md border px-2 py-1.5 transition-colors focus-within:border-teal-700 dark:focus-within:border-teal-400 ${
            error
              ? "border-slate-900 dark:border-slate-100"
              : "border-slate-300 dark:border-slate-700"
          }`}
        >
          {tags.map((tag, index) => (
            <span
              key={tag}
              className="inline-flex max-w-full items-center gap-1 rounded-sm border border-teal-700 bg-teal-50 py-0.5 pr-0.5 pl-2 text-sm font-medium text-teal-700 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-400"
            >
              <span className="truncate">#{tag}</span>
              <button
                type="button"
                tabIndex={-1}
                aria-label={`Bỏ thẻ ${tag}`}
                title="Bỏ thẻ"
                onClick={() => remove(index)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-sm hover:bg-teal-100 dark:hover:bg-teal-900/40"
              >
                <FiX aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              shownActive >= 0 ? optionId(listId, shownActive) : undefined
            }
            aria-describedby={hintId}
            aria-invalid={error ? true : undefined}
            autoComplete="off"
            enterKeyHint="done"
            maxLength={TAG_NAME_MAX}
            readOnly={full}
            value={draft}
            placeholder={
              full
                ? "Đã đủ thẻ"
                : tags.length
                  ? "Thêm thẻ"
                  : "Ví dụ: Môi trường"
            }
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            className="min-w-32 flex-1 bg-transparent py-1 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>
        {rows.length > 0 ? (
          <TagSuggestionList
            id={listId}
            rows={rows}
            active={shownActive}
            onPick={commit}
            onHover={setActive}
          />
        ) : null}
      </div>
      {error ? (
        <p id={hintId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : (
        <p id={hintId} className={mutedText}>
          Nhấn Enter hoặc dấu phẩy để thêm thẻ.
        </p>
      )}
    </div>
  );
}
