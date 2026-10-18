import { useState } from "react";
import type { ReactElement } from "react";
import { FiCheck, FiSearch, FiUsers } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Avatar } from "../../core/components/Avatar.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { useSharedMediaAuthors } from "../hooks.ts";
import { toVietnameseWorkspaceMessage } from "../messages.tsx";
import type { SharedMediaKind } from "../api.ts";

interface ChatSenderPickerProps {
  roomId: string;
  // Only senders who shared this kind are listed (the active media tab).
  kind: SharedMediaKind;
  // "" selects the "everyone" row pinned on top.
  selected: string;
  onSelect: (authorId: string) => void;
}

const ROW =
  "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2.5 " +
  "text-left transition-colors hover:bg-zinc-50 focus-visible:outline-2 " +
  "focus-visible:outline-offset-2 focus-visible:outline-zinc-500 " +
  "dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-400";

// Rooms in big communities can have hundreds of senders; the search box
// only appears once scrolling alone stops being enough.
const SEARCH_THRESHOLD = 10;

// Diacritic-insensitive match: "nguyen" also hits "Nguyen".
function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

// Full-drawer sender list: it replaces the whole room-info view so long
// sender rosters get every pixel of the panel instead of a clipped
// dropdown. Picking a row reports the id and the parent swaps back.
export function ChatSenderPicker({
  roomId,
  kind,
  selected,
  onSelect,
}: ChatSenderPickerProps): ReactElement {
  const [query, setQuery] = useState("");
  const authors = useSharedMediaAuthors(roomId);

  if (authors.isPending) return <LoadingState label="Đang tải…" />;
  if (authors.isError) {
    return (
      <ErrorState
        title="Không tải được danh sách"
        message={toVietnameseWorkspaceMessage(
          authors.error instanceof ApiError
            ? authors.error.code
            : "REQUEST_FAILED",
        )}
      />
    );
  }
  const senders = (authors.data?.items ?? []).filter((a) =>
    a.kinds.includes(kind),
  );
  if (senders.length === 0) {
    return (
      <EmptyState
        title="Trống"
        message="Chưa có ai chia sẻ nội dung loại này."
      />
    );
  }

  const needle = fold(query.trim());
  const matches =
    needle === ""
      ? senders
      : senders.filter((a) => fold(a.author_name).includes(needle));

  return (
    <>
      {senders.length > SEARCH_THRESHOLD && (
        <div className="sticky top-0 z-10 bg-white pb-2 dark:bg-zinc-950">
          <TextField
            pill
            hideLabel
            label="Tìm người gửi"
            placeholder="Tìm theo tên…"
            icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      )}
      {matches.length === 0 ? (
        <EmptyState
          title="Không tìm thấy ai"
          message={`Không có người gửi nào tên "${query.trim()}".`}
        />
      ) : (
        <ul
          role="listbox"
          aria-label="Người gửi"
          className="divide-y divide-zinc-100 dark:divide-zinc-800"
        >
          <li role="presentation">
            <button
              type="button"
              role="option"
              aria-selected={selected === ""}
              onClick={() => onSelect("")}
              className={ROW}
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
              >
                <FiUsers className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Tất cả mọi người
              </span>
              {selected === "" && (
                <FiCheck
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100"
                />
              )}
            </button>
          </li>
          {matches.map((author) => {
            const active = author.author_id === selected;
            return (
              <li key={author.author_id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => onSelect(author.author_id)}
                  className={ROW}
                >
                  <Avatar
                    name={author.author_name}
                    src={author.author_avatar_url}
                    size="md"
                  />
                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      active
                        ? "font-semibold text-zinc-900 dark:text-zinc-100"
                        : "font-medium text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {author.author_name}
                  </span>
                  {active && (
                    <FiCheck
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
