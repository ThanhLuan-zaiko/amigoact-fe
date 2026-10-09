import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { FiClock, FiSearch, FiType, FiUsers } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { ORG_STATUS_LABELS } from "../messages.tsx";

export type OrgSort = "newest" | "name" | "members";

const SORT_OPTIONS: { key: OrgSort; label: string; Icon: typeof FiClock }[] = [
  { key: "newest", label: "Mới nhất", Icon: FiClock },
  { key: "name", label: "Tên A–Z", Icon: FiType },
  { key: "members", label: "Thành viên", Icon: FiUsers },
];

interface OrgListToolbarProps {
  query: string;
  onQuery: (value: string) => void;
  bucket: string;
  onBucket: (bucket: string) => void;
  counts: [string, number][];
  sort: OrgSort;
  onSort: (sort: OrgSort) => void;
  total: number;
}

export function OrgListToolbar({
  query,
  onQuery,
  bucket,
  onBucket,
  counts,
  sort,
  onSort,
  total,
}: OrgListToolbarProps): ReactElement {
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
    <div className="mt-4 flex flex-col gap-3">
      <TextField
        label="Tìm kiếm"
        id="org-search"
        name="org-search"
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Tên hoặc @slug…"
        autoComplete="off"
        icon={<FiSearch className="h-4 w-4" aria-hidden="true" />}
      />
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={bucket === "all" ? "primary" : "secondary"}
            onClick={() => onBucket("all")}
            aria-pressed={bucket === "all"}
          >
            {`Tất cả · ${total}`}
          </Button>
          {counts.map(([key, count]) => (
            <Button
              key={key}
              type="button"
              variant={bucket === key ? "primary" : "secondary"}
              onClick={() => onBucket(key)}
              aria-pressed={bucket === key}
            >
              {`${ORG_STATUS_LABELS[key] ?? key} · ${count}`}
            </Button>
          ))}
        </div>
        <span aria-hidden="true" className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
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
    </div>
  );
}
