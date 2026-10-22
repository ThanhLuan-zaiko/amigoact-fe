import type { ReactElement } from "react";
import { FiClock, FiShield, FiType } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { MemberSortParam } from "../members-api.ts";

const SORT_OPTIONS: { key: MemberSortParam; label: string; Icon: typeof FiClock }[] = [
  { key: "newest", label: "Mới nhất", Icon: FiClock },
  { key: "name", label: "Tên A–Z", Icon: FiType },
  { key: "role", label: "Vai trò", Icon: FiShield },
];

interface MemberListToolbarProps {
  sort: MemberSortParam;
  onSort: (sort: MemberSortParam) => void;
}

export function MemberListToolbar({
  sort,
  onSort,
}: MemberListToolbarProps): ReactElement {
  return (
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
  );
}
