import { useState } from "react";
import type { ReactElement } from "react";
import { FiBriefcase, FiSearch } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { Modal } from "../../core/components/Modal.tsx";
import { TextField } from "../../core/components/TextField.tsx";

export interface OrgChip {
  id: string;
  name: string;
}

const CHIP =
  "inline-flex max-w-full min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 " +
  "text-left text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-zinc-500 dark:focus-visible:outline-zinc-400";

const CHIP_ON =
  "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 " +
  "dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200";

const CHIP_OFF =
  "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 " +
  "dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900";

// Past this many, the rail keeps the active org plus a few neighbours.
// The rest open in the side drawer instead of stacking in the column.
const VISIBLE_LIMIT = 4;

function Chip({
  org,
  selected,
  onSelect,
}: {
  org: OrgChip;
  selected: boolean;
  onSelect: (orgId: string) => void;
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(org.id)}
      className={`${CHIP} ${selected ? CHIP_ON : CHIP_OFF}`}
    >
      <FiBriefcase className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{org.name}</span>
    </button>
  );
}

// Org switcher used by the manage rail: the active org is a filled pill,
// the others stay outlined. Names wrap inside the rail width.
export function OrgChipList({
  orgs,
  orgId,
  onSelect,
}: {
  orgs: OrgChip[];
  orgId: string | null;
  onSelect: (orgId: string) => void;
}): ReactElement {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const selected = orgs.find((org) => org.id === orgId) ?? null;
  const rest = orgs.filter((org) => org.id !== orgId);
  const preview = VISIBLE_LIMIT - (selected ? 1 : 0);
  const shown = rest.slice(0, preview);
  const hidden = rest.length - preview;
  const needle = filter.trim().toLowerCase();
  const matched = needle
    ? orgs.filter((org) => org.name.toLowerCase().includes(needle))
    : orgs;

  function closePicker(): void {
    setPickerOpen(false);
    setFilter("");
  }

  function pick(id: string): void {
    onSelect(id);
    closePicker();
  }

  return (
    <div className="flex flex-col gap-2">
      {selected && (
        <div role="group" aria-label="Tổ chức đang chọn" className="flex flex-wrap gap-2">
          <Chip org={selected} selected onSelect={onSelect} />
        </div>
      )}
      {shown.length > 0 && (
        <div role="group" aria-label="Chọn tổ chức" className="flex flex-wrap gap-2">
          {shown.map((org) => (
            <Chip key={org.id} org={org} selected={false} onSelect={onSelect} />
          ))}
        </div>
      )}
      {hidden > 0 && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setPickerOpen(true)}
          aria-expanded={pickerOpen}
        >
          {`Xem thêm ${hidden} tổ chức`}
        </Button>
      )}
      <Modal side open={pickerOpen} title="Tổ chức của bạn" onClose={closePicker}>
        <div className="flex flex-col gap-3">
          <TextField
            label="Lọc tổ chức"
            hideLabel
            pill
            name="org-chip-filter"
            type="search"
            autoComplete="off"
            placeholder="Lọc tổ chức"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            icon={<FiSearch className="h-4 w-4" />}
          />
          {matched.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Không có tổ chức phù hợp.
            </p>
          ) : (
            <div role="group" aria-label="Tất cả tổ chức" className="flex flex-wrap gap-2">
              {matched.map((org) => (
                <Chip
                  key={org.id}
                  org={org}
                  selected={org.id === orgId}
                  onSelect={pick}
                />
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
