import type { ReactElement } from "react";
import { FiCalendar, FiPlusCircle, FiUsers } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { ApiError } from "../../core/api.ts";
import { useMyOrgs } from "../hooks.ts";
import { ORG_KIND_LABELS } from "../messages.tsx";

export function OverviewTiles(): ReactElement {
  // Wide fetch: tiles aggregate over every org, not one pager slice.
  const orgs = useMyOrgs(false, { limit: 100 });
  const items = orgs.data?.items ?? [];
  const total = orgs.data?.total ?? 0;
  const totalMembers = items.reduce((sum, org) => sum + org.member_count, 0);
  const totalEvents = items.reduce((sum, org) => sum + org.event_count, 0);

  return (
    <>
      <BentoCard className="md:col-span-2 lg:col-span-4">
        <div data-rise className="flex items-center gap-2">
          <FiUsers className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Tổ chức
          </h3>
        </div>
        {orgs.isPending ? (
          <div className="mt-3"><LoadingState label="Đang tải tổ chức…" /></div>
        ) : orgs.isError ? (
          <div className="mt-3">
            <ErrorState
              title="Không tải được tổ chức"
              message={orgs.error instanceof ApiError ? orgs.error.message : "Có lỗi xảy ra."}
            />
          </div>
        ) : (
          <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
            {total}
          </p>
        )}
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {totalMembers} thành viên đang tham gia.
        </p>
      </BentoCard>
      <BentoCard className="md:col-span-2 lg:col-span-4">
        <div data-rise className="flex items-center gap-2">
          <FiCalendar className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Sự kiện
          </h3>
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-100">
          {orgs.data ? totalEvents : "—"}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Sự kiện do các tổ chức của bạn tổ chức.
        </p>
      </BentoCard>
      <BentoCard className="md:col-span-2 lg:col-span-4">
        <div data-rise className="flex items-center gap-2">
          <FiPlusCircle className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Bắt đầu mới
          </h3>
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Cá nhân hay doanh nghiệp đều tạo được tổ chức, câu lạc bộ hay hội nhóm.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            to="/manage/orgs/create"
            variant="primary"
            icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
          >
            Tạo tổ chức
          </Button>
          <Button
            to="/manage/orgs"
            variant="secondary"
            icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
          >
            Xem danh sách
          </Button>
        </div>
        {orgs.data && total === 0 && (
          <div className="mt-3">
            <EmptyState
              title="Chưa có tổ chức nào"
              message="Tạo tổ chức đầu tiên để mở sự kiện và mời thành viên."
            />
          </div>
        )}
        {orgs.data && total > 0 && (
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Mới nhất: {items[0].name} · {ORG_KIND_LABELS[items[0].kind] ?? items[0].kind}
          </p>
        )}
      </BentoCard>
    </>
  );
}
