import type { ReactElement } from "react";
import type { StatusFacet } from "../browse-api.ts";
import { MY_REGISTRATION_LABELS } from "../messages.tsx";
import { FilterChip } from "./FilterChip.tsx";

interface MyStatusFilterProps {
  statuses: StatusFacet[];
  value: string;
  onChange: (status: string | null) => void;
}

// Status chips for the signed-in view. Counts come from the facet, which is
// computed before the status filter itself, so every chip stays reachable.
export function MyStatusFilter({
  statuses,
  value,
  onChange,
}: MyStatusFilterProps): ReactElement {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterChip selected={value === ""} onClick={() => onChange(null)}>
        Tất cả ({total})
      </FilterChip>
      {statuses.map((item) => (
        <FilterChip
          key={item.status}
          selected={value === item.status}
          onClick={() => onChange(item.status)}
        >
          {MY_REGISTRATION_LABELS[item.status] ?? item.status} ({item.count})
        </FilterChip>
      ))}
    </div>
  );
}
