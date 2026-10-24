import type { ReactElement } from "react";
import { FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";

export interface ActiveFilter {
  key: "org" | "status" | "tag" | "day" | "q";
  label: string;
}

// Removable chips for the filters in the URL. The rail is hidden on phones,
// so these chips are the only way to see and clear filters there.
export function ActiveFilters({
  filters,
  onClear,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onClear: (key: ActiveFilter["key"]) => void;
  onClearAll: () => void;
}): ReactElement | null {
  if (filters.length === 0) return null;
  return (
    <div
      role="group"
      aria-label="Bộ lọc đang áp dụng"
      className="flex flex-wrap items-center gap-2"
    >
      {filters.map((filter) => (
        <Button
          key={filter.key}
          type="button"
          variant="secondary"
          onClick={() => onClear(filter.key)}
          aria-label={`Bỏ lọc ${filter.label}`}
          icon={<FiX className="h-4 w-4" aria-hidden="true" />}
        >
          {filter.label}
        </Button>
      ))}
      {filters.length > 1 && (
        <Button type="button" variant="ghost" onClick={onClearAll}>
          Xóa bộ lọc
        </Button>
      )}
    </div>
  );
}
