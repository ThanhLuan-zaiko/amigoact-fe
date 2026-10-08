import type { ReactElement } from "react";
import { FiUser } from "react-icons/fi";
import { BentoCard } from "../core/components/BentoCard.tsx";
import { EmptyState } from "../core/components/Feedback.tsx";

export function DashboardMembersPage(): ReactElement {
  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div data-rise className="flex items-center gap-2">
        <FiUser className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
        <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
          Thành viên
        </h3>
      </div>
      <div className="mt-3">
        <EmptyState
          title="Thành viên"
          message="Mời, duyệt và phân quyền thành viên cho từng tổ chức."
        />
      </div>
    </BentoCard>
  );
}
