import type { ReactElement } from "react";
import { FiPlusCircle, FiUsers } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { ApiError } from "../../core/api.ts";
import { useMyOrgs } from "../hooks.ts";
import { ORG_KIND_LABELS, toVietnameseDashboardMessage } from "../messages.tsx";

export function OrgListCard(): ReactElement {
  const orgs = useMyOrgs();

  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div data-rise className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FiUsers className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
          <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            Tổ chức của tôi
          </h3>
        </div>
        <Button
          to="/my-dashboard/create"
          variant="secondary"
          icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
        >
          Tạo mới
        </Button>
      </div>
      <div className="mt-3" aria-live="polite" aria-busy={orgs.isPending}>
        {orgs.isPending && <LoadingState label="Đang tải danh sách tổ chức…" />}
        {orgs.isError && (
          <ErrorState
            title="Không tải được danh sách"
            message={toVietnameseDashboardMessage(
              orgs.error instanceof ApiError ? orgs.error.code : "REQUEST_FAILED",
            )}
          />
        )}
        {orgs.data && orgs.data.length === 0 && (
          <>
            <EmptyState
              title="Chưa có tổ chức nào"
              message="Tạo tổ chức, câu lạc bộ hay hội nhóm đầu tiên của bạn."
            />
            <div className="mt-3">
              <Button
                to="/my-dashboard/create"
                variant="primary"
                icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
              >
                Tạo tổ chức
              </Button>
            </div>
          </>
        )}
        {orgs.data && orgs.data.length > 0 && (
          <ul className="flex flex-col gap-3">
            {orgs.data.map((org) => (
              <li
                key={org.id}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {org.name}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {ORG_KIND_LABELS[org.kind] ?? org.kind} · @{org.slug} · {org.member_count} thành viên · {org.event_count} sự kiện
                  </p>
                  {org.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {org.description}
                    </p>
                  )}
                </div>
                <Button
                  to="/my-dashboard/overview"
                  variant="secondary"
                  icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
                >
                  Quản lý
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </BentoCard>
  );
}
