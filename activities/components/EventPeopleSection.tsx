import type { ReactElement } from "react";
import type { ApiError } from "../../core/api.ts";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { Section } from "../../core/components/Section.tsx";
import type { ActivityDetailView } from "../api.ts";
import {
  PARTNER_ROLE_LABELS,
  toVietnameseBrowseMessage,
} from "../messages.tsx";

interface EventPeopleSectionProps {
  view: ActivityDetailView | undefined;
  error: ApiError | null;
  onRetry: () => void;
}

// Partners and staff for one activity. Until the detail view arrives the
// section shows loading, or an error with a retry action.
export function EventPeopleSection({
  view,
  error,
  onRetry,
}: EventPeopleSectionProps): ReactElement {
  return (
    <Section>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Đối tác & nhân sự
      </h3>
      {view !== undefined ? (
        <ul className="mt-3 flex flex-col gap-2 text-sm">
          {view.partners.map((p) => (
            <li
              key={p.org_id}
              className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
            >
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {p.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {PARTNER_ROLE_LABELS[p.role] ?? p.role}
                {p.note ? ` · ${p.note}` : ""}
              </p>
            </li>
          ))}
          {view.partners.length === 0 && view.staff.length === 0 && (
            <EmptyState
              title="Chưa công bố"
              message="Đối tác và nhân sự sẽ hiện khi được phân công."
            />
          )}
        </ul>
      ) : error !== null ? (
        <ErrorState
          title="Không tải được đối tác và nhân sự"
          message={toVietnameseBrowseMessage(error.code)}
          actionLabel="Thử lại"
          onAction={onRetry}
        />
      ) : (
        <LoadingState label="Đang tải đối tác và nhân sự…" />
      )}
    </Section>
  );
}
