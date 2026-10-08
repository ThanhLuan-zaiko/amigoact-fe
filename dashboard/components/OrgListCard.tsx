import { useState } from "react";
import type { ReactElement } from "react";
import { FiImage, FiPlusCircle, FiTrash2, FiUsers } from "react-icons/fi";
import { BentoCard } from "../../core/components/BentoCard.tsx";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { ApiError } from "../../core/api.ts";
import { useRiseOn } from "../../core/motion.ts";
import { useSession } from "../../auth/hooks.ts";
import { useMyOrgs } from "../hooks.ts";
import { ORG_KIND_LABELS, toVietnameseDashboardMessage } from "../messages.tsx";
import type { DashboardOrg } from "../api.ts";
import { MediaDropzone } from "./MediaDropzone.tsx";
import { OrgCardActions } from "./OrgCardActions.tsx";
import { OrgEditCard } from "./OrgEditCard.tsx";

function OrgRow({
  org,
  editing,
  expanded,
  compact,
  canManage,
  onEdit,
  onToggleMedia,
}: {
  org: DashboardOrg;
  editing: boolean;
  expanded: boolean;
  compact: boolean;
  canManage: boolean;
  onEdit: () => void;
  onToggleMedia: () => void;
}): ReactElement {
  return (
    <li
      data-rise
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap gap-2">
          {!compact && (
            <>
              <Button
                to="/manage/overview"
                variant="secondary"
                icon={<FiUsers className="h-4 w-4" aria-hidden="true" />}
              >
                Quản lý
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onToggleMedia}
                aria-expanded={expanded}
                aria-pressed={expanded}
                icon={<FiImage className="h-4 w-4" aria-hidden="true" />}
              >
                Tệp
              </Button>
            </>
          )}
        </div>
      </div>
      <OrgCardActions org={org} isEditing={editing} onEdit={onEdit} />
      {editing && <OrgEditCard org={org} onDone={onEdit} />}
      {expanded && <MediaDropzone orgId={org.id} canManage={canManage} />}
    </li>
  );
}

export function OrgListCard(): ReactElement {
  const orgs = useMyOrgs(false);
  const trash = useMyOrgs(true);
  const session = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const listRef = useRiseOn<HTMLUListElement>(orgs.data);
  const trashRef = useRiseOn<HTMLUListElement>(trash.data);
  const live = (orgs.data ?? []).filter((org) => org.deleted_at === null);
  const trashed = (trash.data ?? []).filter((org) => org.deleted_at !== null);

  return (
    <>
      <BentoCard className="md:col-span-6 lg:col-span-12">
        <div data-rise className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiUsers className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
            <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Tổ chức của tôi
            </h3>
          </div>
          <Button
            to="/manage/orgs/create"
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
          {orgs.data && live.length === 0 && (
            <>
              <EmptyState
                title="Chưa có tổ chức nào"
                message="Tạo tổ chức, câu lạc bộ hay hội nhóm đầu tiên của bạn."
              />
              <div className="mt-3">
                <Button
                  to="/manage/orgs/create"
                  variant="primary"
                  icon={<FiPlusCircle className="h-4 w-4" aria-hidden="true" />}
                >
                  Tạo tổ chức
                </Button>
              </div>
            </>
          )}
          {live.length > 0 && (
            <ul ref={listRef} className="flex flex-col gap-3">
              {live.map((org) => (
                <OrgRow
                  key={org.id}
                  org={org}
                  editing={editingId === org.id}
                  expanded={expandedId === org.id}
                  compact={false}
                  canManage={org.owner_id === session.data?.id}
                  onEdit={() => setEditingId((current) => (current === org.id ? null : org.id))}
                  onToggleMedia={() =>
                    setExpandedId((current) => (current === org.id ? null : org.id))
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </BentoCard>
      {trashed.length > 0 && (
        <BentoCard className="md:col-span-6 lg:col-span-12">
          <div className="flex items-center gap-2">
            <FiTrash2 className="h-5 w-5 text-zinc-900 dark:text-brand" aria-hidden="true" />
            <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
              Thùng rác
            </h3>
          </div>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tổ chức đã xóa mềm. Khôi phục để dùng tiếp, hoặc xóa cứng để xóa vĩnh viễn cùng toàn bộ tệp.
          </p>
          <ul ref={trashRef} className="mt-3 flex flex-col gap-3">
            {trashed.map((org) => (
              <OrgRow
                key={org.id}
                org={org}
                editing={false}
                expanded={false}
                compact={true}
                canManage={false}
                onEdit={() => {}}
                onToggleMedia={() => {}}
              />
            ))}
          </ul>
        </BentoCard>
      )}
    </>
  );
}
