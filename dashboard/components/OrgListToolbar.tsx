import type { ReactElement } from "react";
import { FiClock, FiShield, FiTrash2, FiType, FiUsers } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { ORG_STATUS_LABELS } from "../messages.tsx";

export type OrgSort = "newest" | "name" | "members";

const SORT_OPTIONS: { key: OrgSort; label: string; Icon: typeof FiClock }[] = [
  { key: "newest", label: "Mới nhất", Icon: FiClock },
  { key: "name", label: "Tên A–Z", Icon: FiType },
  { key: "members", label: "Thành viên", Icon: FiUsers },
];

interface OrgListToolbarProps {
  bucket: string;
  onBucket: (bucket: string) => void;
  counts: [string, number][];
  trashCount: number;
  sort: OrgSort;
  onSort: (sort: OrgSort) => void;
  total: number;
}

export function OrgListToolbar({
  bucket,
  onBucket,
  counts,
  trashCount,
  sort,
  onSort,
  total,
}: OrgListToolbarProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={bucket === "all" ? "primary" : "secondary"}
            onClick={() => onBucket("all")}
            aria-pressed={bucket === "all"}
            icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
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
              icon={<FiShield className="h-4 w-4" aria-hidden="true" />}
            >
              {`${ORG_STATUS_LABELS[key] ?? key} · ${count}`}
            </Button>
          ))}
          <Button
            type="button"
            variant={bucket === "trash" ? "primary" : "secondary"}
            onClick={() => onBucket("trash")}
            aria-pressed={bucket === "trash"}
            icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
          >
            {`Thùng rác · ${trashCount}`}
          </Button>
        </div>
        {bucket !== "trash" && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
