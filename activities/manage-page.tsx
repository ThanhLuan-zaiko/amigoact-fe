import { useState, type ReactElement } from "react";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
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
import { useCategories, useCreateActivity, useOrgActivities } from "./hooks.ts";

export function ManageEventsPage(): ReactElement {
  const orgs = useMyOrgs();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const selected = orgId ?? orgs.data?.items[0]?.id ?? null;
  const activities = useOrgActivities(selected);
  const categories = useCategories(selected ?? undefined);
  const create = useCreateActivity(selected ?? "");

  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <div data-rise className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiCalendar
              className="h-5 w-5 text-zinc-900 dark:text-brand"
              aria-hidden="true"
            />
            <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Quản lý hoạt động
            </h1>
          </div>
          {selected && (
            <Button
              variant={creating ? "secondary" : "primary"}
              onClick={() => setCreating((v) => !v)}
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
      </BentoCard>

      {creating && selected && (
        <BentoCard className="md:col-span-6 lg:col-span-12">
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
        </BentoCard>
      )}

      {selected && (
        <BentoCard className="md:col-span-6 lg:col-span-12">
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
        </BentoCard>
      )}
    </>
  );
}
