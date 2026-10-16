import { useState, type ReactElement } from "react";
import { useSearchParams } from "react-router-dom";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { Section } from "../core/components/Section.tsx";
import { Button } from "../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../core/components/Feedback.tsx";
import { useMyOrgs } from "../dashboard/hooks.ts";
import { MemberOrgPicker } from "../dashboard/components/MemberOrgPicker.tsx";
import { ActivityCard } from "./components/ActivityCard.tsx";
import { ActivityForm } from "./components/ActivityForm.tsx";
import {
  useCategories,
  useCreateActivity,
  useLiveActivities,
  useOrgActivities,
} from "./hooks.ts";

export function ManageEventsPage(): ReactElement {
  const orgs = useMyOrgs();
  const [orgId, setOrgId] = useState<string | null>(null);
  // The create form is deep-linkable (?create=1) so the rail's primary
  // action lands straight on it.
  const [searchParams, setSearchParams] = useSearchParams();
  const creating = searchParams.get("create") === "1";
  const setCreating = (next: boolean): void => {
    setSearchParams(
      (params) => {
        if (next) params.set("create", "1");
        else params.delete("create");
        return params;
      },
      { replace: true },
    );
  };
  const selected = orgId ?? orgs.data?.items[0]?.id ?? null;
  useLiveActivities(selected ?? undefined);
  const activities = useOrgActivities(selected);
  const categories = useCategories(selected ?? undefined);
  const create = useCreateActivity(selected ?? "");

  return (
    <>
      <Section>
        <div data-rise className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiCalendar
              className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
              aria-hidden="true"
            />
            <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Quản lý hoạt động
            </h1>
          </div>
          {selected && (
            <Button
              variant={creating ? "secondary" : "primary"}
              onClick={() => setCreating(!creating)}
              icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}
            >
              {creating ? "Đóng" : "Tạo hoạt động"}
            </Button>
          )}
        </div>
        {orgs.isPending && <LoadingState label="Đang tải tổ chức…" />}
        {orgs.isSuccess && orgs.data.items.length === 0 && (
          <EmptyState
            title="Chưa có tổ chức"
            message="Tạo tổ chức trước khi lên lịch hoạt động."
          />
        )}
        {orgs.isSuccess && orgs.data.items.length > 0 && (
          <MemberOrgPicker
            orgs={orgs.data.items}
            selectedId={selected}
            onSelect={setOrgId}
          />
        )}
      </Section>

      {creating && selected && (
        <Section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Hoạt động mới
          </h2>
          <div className="mt-3">
            <ActivityForm
              categories={categories.data ?? []}
              submitLabel="Tạo bản nháp"
              onSubmit={(input) => create.mutateAsync(input)}
              onDone={() => setCreating(false)}
            />
          </div>
        </Section>
      )}

      {selected && (
        <Section>
          {activities.isPending && (
            <LoadingState label="Đang tải hoạt động…" />
          )}
          {activities.isError && (
            <ErrorState
              title="Không tải được"
              message={activities.error.message}
            />
          )}
          {activities.isSuccess && activities.data.length === 0 && (
            <EmptyState
              title="Chưa có hoạt động"
              message="Tạo bản nháp đầu tiên cho tổ chức này."
            />
          )}
          <ul className="flex flex-col gap-2">
            {(activities.data ?? []).map((a) => (
              <li key={a.id}>
                <ActivityCard
                  activity={a}
                  href={`/manage/events/${a.org_id}/${a.id}`}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}
