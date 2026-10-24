import type { ReactElement } from "react";
import {
  FiCheckCircle,
  FiEdit3,
  FiGlobe,
  FiList,
  FiPlayCircle,
  FiXCircle,
} from "react-icons/fi";
import type { ActivitySummary } from "../api.ts";
import { ACTIVITY_STATUS_LABELS } from "../messages.tsx";
import { FilterChip } from "./FilterChip.tsx";

const STATUS_OPTIONS = [
  { status: "draft", Icon: FiEdit3 },
  { status: "published", Icon: FiGlobe },
  { status: "ongoing", Icon: FiPlayCircle },
  { status: "completed", Icon: FiCheckCircle },
  { status: "cancelled", Icon: FiXCircle },
] as const;

interface StatusFilterProps {
  activities: ActivitySummary[];
  value: string | null;
  onChange: (status: string | null) => void;
}

// Lifecycle filter for the feed. Counts come from the rows already loaded,
// so each chip matches the list under it without another request.
export function StatusFilter({
  activities,
  value,
  onChange,
}: StatusFilterProps): ReactElement {
  const countOf = (status: string | null): number =>
    status === null
      ? activities.length
      : activities.filter((a) => a.status === status).length;

  return (
    <div
      role="group"
      aria-label="Lọc theo trạng thái"
      className="flex flex-wrap gap-2"
    >
      <FilterChip
        selected={value === null}
        onClick={() => onChange(null)}
        icon={<FiList className="h-4 w-4" aria-hidden="true" />}
      >
        Tất cả
        <span className="tabular-nums opacity-80">{countOf(null)}</span>
      </FilterChip>
      {STATUS_OPTIONS.map(({ status, Icon }) => (
        <FilterChip
          key={status}
          selected={value === status}
          onClick={() => onChange(status)}
          icon={<Icon className="h-4 w-4" aria-hidden="true" />}
        >
          {ACTIVITY_STATUS_LABELS[status]}
          <span className="tabular-nums opacity-80">{countOf(status)}</span>
        </FilterChip>
      ))}
    </div>
  );
}
