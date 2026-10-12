import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { FiClock, FiSearch, FiShield, FiType } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { MemberSortParam } from "../members-api.ts";

const SORT_OPTIONS: { key: MemberSortParam; label: string; Icon: typeof FiClock }[] = [
  { key: "newest", label: "Mới nhất", Icon: FiClock },
  { key: "name", label: "Tên A–Z", Icon: FiType },
  { key: "role", label: "Vai trò", Icon: FiShield },
];

interface MemberListToolbarProps {
  query: string;
  onQuery: (value: string) => void;
  sort: MemberSortParam;
  onSort: (sort: MemberSortParam) => void;
}

export function MemberListToolbar({
  query,
  onQuery,
  sort,
  onSort,
}: MemberListToolbarProps): ReactElement {
  // Draft locally so each keystroke does not fire a server request.
  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (syncedQuery !== query) {
    setSyncedQuery(query);
    setDraft(query);
  }
  useEffect(() => {
    if (draft === query) return;
    const timer = setTimeout(() => onQuery(draft), 300);
    return () => clearTimeout(timer);
  }, [draft, query, onQuery]);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <TextField
        label="Tìm kiếm"
        id="member-search"
        name="member-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Tên hoặc email thành viên…"
        autoComplete="off"
        className="sm:flex-1"
        icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
      />
      <div role="group" aria-label="Sắp xếp" className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map(({ key, label, Icon }) => (
          <Button
            key={key}
            type="button"
            variant={sort === key ? "primary" : "ghost"}
            onClick={() => onSort(key)}
            aria-pressed={sort === key}
            icon={<Icon className="h-4 w-4" aria-hidden="true" />}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
