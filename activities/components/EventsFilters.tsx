import { useEffect, useState, type ReactElement } from "react";
import { FiSearch } from "react-icons/fi";
import { TextField } from "../../core/components/TextField.tsx";
import { FilterChip } from "./FilterChip.tsx";

const SEARCH_DEBOUNCE_MS = 350;
// Backend cap on the search text (docs/EVENTS.md).
const SEARCH_MAX = 100;

interface EventsFiltersProps {
  q: string;
  mode: string;
  open: boolean;
  onPatch: (patch: Record<string, string | null>) => void;
}

// Search box plus the quick toggles. Typing is debounced into the URL, and
// the box follows the URL when the URL changes from elsewhere.
export function EventsFilters({
  q,
  mode,
  open,
  onPatch,
}: EventsFiltersProps): ReactElement {
  const [draft, setDraft] = useState(q);
  const [synced, setSynced] = useState(q);
  // Follow the URL when it changes from elsewhere (back button, reset).
  if (q !== synced) {
    setSynced(q);
    setDraft(q);
  }

  useEffect(() => {
    if (draft === q) return undefined;
    const timer = setTimeout(() => {
      onPatch({ q: draft.trim() || null, page: null });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, q, onPatch]);

  return (
    <div className="flex flex-col gap-3">
      <TextField
        label="Tìm sự kiện"
        hideLabel
        pill
        type="search"
        autoComplete="off"
        maxLength={SEARCH_MAX}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Tên sự kiện, địa điểm, tổ chức"
        icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          selected={open}
          onClick={() => onPatch({ open: open ? null : "1", page: null })}
        >
          Đang mở đăng ký
        </FilterChip>
        <FilterChip
          selected={mode === "online"}
          onClick={() =>
            onPatch({ mode: mode === "online" ? null : "online", page: null })
          }
        >
          Trực tuyến
        </FilterChip>
        <FilterChip
          selected={mode === "offline"}
          onClick={() =>
            onPatch({ mode: mode === "offline" ? null : "offline", page: null })
          }
        >
          Trực tiếp
        </FilterChip>
      </div>
    </div>
  );
}
