import type { ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { RailCard } from "../../core/components/RailCard.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { monthKey, parseMonth } from "../calendar.ts";
import { applyFilters, countBy, readFilters } from "../feed-utils.ts";
import { useMyActivities } from "../feed-hooks.ts";
import { ActivityCalendar } from "./ActivityCalendar.tsx";
import { FilterChip } from "./FilterChip.tsx";
import { StatusFilter } from "./StatusFilter.tsx";

// Right-rail controls for /manage/events: search, create and trash, a month
// calendar that filters the feed by day, the org filter, and the status
// filter. Every choice is written to the URL.
export function EventsRail(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = readFilters(searchParams);
  const creating = searchParams.get("create") === "1";
  const feed = useMyActivities(filters.trash);
  const orgs = feed.data?.orgs ?? [];
  const items = feed.data?.items ?? [];
  const canCreate = orgs.some((org) => org.can_create);
  const canTrash = orgs.some((org) => org.can_delete);
  const month = parseMonth(searchParams.get("month"));
  // Each facet counts the rows that pass every filter except its own, so a
  // chip's number always says what clicking it would show.
  const forCalendar = applyFilters(items, { ...filters, day: null });
  const forOrg = applyFilters(items, { ...filters, org: null });
  const forStatus = applyFilters(items, { ...filters, status: null });
  const orgCounts = countBy(forOrg, (item) => item.org_id);

  function patch(next: Record<string, string | null>): void {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(next)) {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        }
        return params;
      },
      { replace: true },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 bg-white py-2 dark:bg-zinc-950">
        <form role="search" onSubmit={(event) => event.preventDefault()}>
          <TextField
            label="Tìm hoạt động"
            hideLabel
            pill
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Tìm hoạt động"
            value={filters.q}
            onChange={(event) => patch({ q: event.target.value })}
            icon={<FiSearch className="h-4 w-4" />}
          />
        </form>
      </div>
      {(canCreate || canTrash) && (
        <div className="flex flex-wrap gap-2">
          {canCreate && (
            // Create is an action, so it is always the filled primary button.
            // It never reports a pressed state.
            <Button
              type="button"
              variant={creating ? "secondary" : "primary"}
              onClick={() => patch({ create: creating ? null : "1" })}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              {creating ? "Đóng biểu mẫu" : "Tạo hoạt động"}
            </Button>
          )}
          {canTrash && (
            <FilterChip
              selected={filters.trash}
              onClick={() => patch({ trash: filters.trash ? null : "1" })}
              icon={<FiTrash2 className="h-4 w-4" aria-hidden="true" />}
            >
              Thùng rác
            </FilterChip>
          )}
        </div>
      )}
      <RailCard title="Lịch">
        <div className="px-4 pb-4">
          <ActivityCalendar
            compact
            month={month}
            activities={forCalendar}
            selectedDay={filters.day}
            onMonthChange={(next) =>
              patch({ month: monthKey(next), day: null })
            }
            onSelectDay={(day) => patch({ day })}
          />
        </div>
      </RailCard>
      <RailCard title="Tổ chức">
        <div
          role="group"
          aria-label="Lọc theo tổ chức"
          className="flex flex-wrap gap-2 px-4 pb-4"
        >
          <FilterChip
            selected={filters.org === null}
            onClick={() => patch({ org: null })}
          >
            Tất cả
            <span className="tabular-nums opacity-80">{forOrg.length}</span>
          </FilterChip>
          {orgs.map((org) => (
            <FilterChip
              key={org.id}
              selected={filters.org === org.id}
              onClick={() => patch({ org: org.id })}
            >
              {org.name}
              <span className="tabular-nums opacity-80">
                {orgCounts.get(org.id) ?? 0}
              </span>
            </FilterChip>
          ))}
        </div>
      </RailCard>
      <RailCard title="Trạng thái">
        <div className="px-4 pb-4">
          <StatusFilter
            activities={forStatus}
            value={filters.status}
            onChange={(status) => patch({ status })}
          />
        </div>
      </RailCard>
    </div>
  );
}
