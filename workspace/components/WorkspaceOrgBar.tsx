import type { ReactElement, ReactNode } from "react";
import { FiBriefcase } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { LoadingState } from "../../core/components/Feedback.tsx";

export interface WorkspaceOrgOption {
  id: string;
  name: string;
}

interface WorkspaceOrgBarProps {
  orgs: WorkspaceOrgOption[] | undefined;
  orgId: string | null;
  title: string;
  onSelect: (orgId: string) => void;
  trailing?: ReactNode;
}

// Org context strip shared by the workspace surfaces: chips pick the org
// (?org= deep link), the trailing slot carries per-page actions/badges.
export function WorkspaceOrgBar({
  orgs,
  orgId,
  title,
  onSelect,
  trailing,
}: WorkspaceOrgBarProps): ReactElement {
  return (
    <BentoCard className="md:col-span-6 lg:col-span-12">
      <div
        data-rise
        className="flex flex-wrap items-start justify-between gap-2"
      >
        <div>
          <h1 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Chọn tổ chức để xem không gian làm việc của thành viên.
          </p>
        </div>
        {trailing}
      </div>
      {orgs === undefined && (
        <div className="mt-3">
          <LoadingState label="Đang tải danh sách tổ chức…" />
        </div>
      )}
      {orgs !== undefined && orgs.length === 0 && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Bạn chưa tham gia tổ chức nào. Hãy tạo hoặc xin tham gia một tổ chức
          trước.
        </p>
      )}
      {orgs !== undefined && orgs.length > 0 && (
        <div
          role="group"
          aria-label="Chọn tổ chức"
          className="mt-3 flex flex-wrap gap-2"
        >
          {orgs.map((org) => (
            <Button
              key={org.id}
              type="button"
              variant={orgId === org.id ? "primary" : "secondary"}
              onClick={() => onSelect(org.id)}
              aria-pressed={orgId === org.id}
              icon={<FiBriefcase className="h-4 w-4" aria-hidden="true" />}
            >
              {org.name}
            </Button>
          ))}
        </div>
      )}
    </BentoCard>
  );
}
