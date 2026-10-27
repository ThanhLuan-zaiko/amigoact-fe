import type { ReactElement } from "react";
import { Button } from "../../core/components/Button.tsx";
import { SelectField } from "../../core/components/SelectField.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type {
  CategoryFacet,
  CityFacet,
  TagFacet,
} from "../browse-api.ts";
import { isRangeReversed, type EventsFilters } from "../browse-utils.ts";
import { TagFilter } from "./TagFilter.tsx";

interface EventsFilterPanelProps {
  filters: EventsFilters;
  categories: CategoryFacet[];
  cities: CityFacet[];
  tags: TagFacet[];
  tagName: string | undefined;
  showSort: boolean;
  hasNarrowing: boolean;
  onPatch: (patch: Record<string, string | null>) => void;
  onTag: (slug: string | undefined, name?: string) => void;
  onClear: () => void;
}

// The rail is narrower than the page column and sits outside its size
// container, so the fields stack in one column.

const SORT_OPTIONS = [
  { value: "start", label: "Ngày diễn ra" },
  { value: "published", label: "Mới công bố" },
];

const RANGE_ERROR = "Ngày kết thúc phải sau ngày bắt đầu";

// Category, city, dates and tag. Each change resets paging to page 1.
export function EventsFilterPanel({
  filters,
  categories,
  cities,
  tags,
  tagName,
  showSort,
  hasNarrowing,
  onPatch,
  onTag,
  onClear,
}: EventsFilterPanelProps): ReactElement {
  const categoryOptions = [
    { value: "", label: "Tất cả danh mục" },
    ...categories.map((item) => ({
      value: item.category_id,
      label: `${item.name} (${item.count})`,
    })),
  ];
  const cityOptions = [
    { value: "", label: "Tất cả thành phố" },
    ...cities.map((item) => ({
      value: item.city,
      label: `${item.city} (${item.count})`,
    })),
  ];
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <SelectField
          label="Danh mục"
          value={filters.category}
          options={categoryOptions}
          onChange={(value) => onPatch({ category: value || null, page: null })}
        />
        <SelectField
          label="Thành phố"
          value={filters.city}
          options={cityOptions}
          onChange={(value) => onPatch({ city: value || null, page: null })}
        />
        <TextField
          label="Từ ngày"
          type="date"
          max={filters.to || undefined}
          value={filters.from}
          onChange={(event) =>
            onPatch({ from: event.target.value || null, page: null })
          }
        />
        <TextField
          label="Đến ngày"
          type="date"
          min={filters.from || undefined}
          value={filters.to}
          error={isRangeReversed(filters) ? RANGE_ERROR : undefined}
          onChange={(event) =>
            onPatch({ to: event.target.value || null, page: null })
          }
        />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Thẻ
          </span>
          <TagFilter
            slug={filters.tag || undefined}
            name={tagName}
            tags={tags}
            onChange={onTag}
          />
        </div>
        {showSort && (
          <SelectField
            label="Sắp xếp"
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(value) =>
              onPatch({ sort: value === "start" ? null : value, page: null })
            }
          />
        )}
      </div>
      {hasNarrowing && (
        <div>
          <Button variant="ghost" onClick={onClear}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  );
}
