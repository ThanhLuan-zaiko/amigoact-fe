import type { ReactElement } from "react";
import { ApiError } from "../../core/api.ts";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardOrg } from "../api.ts";
import { OrgRow } from "./OrgRow.tsx";

interface OrgTrashListProps {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  items: DashboardOrg[];
  filtering: boolean;
  onResetFilters: () => void;
}

// Trash tab body: soft-deleted orgs fetched wide client-side (no server
// pagination/sort), live-filtered by the shared search query.
export function OrgTrashList({
  isPending,
  isError,
  error,
  items,
  filtering,
  onResetFilters,
}: OrgTrashListProps): ReactElement {
  return (
    <>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Tổ chức đã xóa mềm. Khôi phục để dùng tiếp, hoặc xóa cứng để xóa vĩnh
        viễn cùng toàn bộ tệp.
      </p>
      {isPending && <LoadingState label="Đang tải thùng rác…" />}
      {isError && (
        <ErrorState
          title="Không tải được thùng rác"
          message={toVietnameseDashboardMessage(
            error instanceof ApiError ? error.code : "REQUEST_FAILED",
          )}
        />
      )}
      {!isPending && !isError && items.length === 0 && filtering && (
        <EmptyState
          title="Không có tổ chức phù hợp"
          message="Thử từ khóa khác."
          actionLabel="Xóa bộ lọc"
          onAction={onResetFilters}
        />
      )}
      {!isPending && !isError && items.length === 0 && !filtering && (
        <EmptyState
          title="Thùng rác trống"
          message="Tổ chức đã xóa sẽ nằm ở đây để khôi phục hoặc xóa vĩnh viễn."
        />
      )}
      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-3">
          {items.map((org) => (
            <OrgRow
              key={org.id}
              org={org}
              editing={false}
              compact={true}
              onEdit={() => {}}
              onOpenMedia={() => {}}
            />
          ))}
        </ul>
      )}
    </>
  );
}
