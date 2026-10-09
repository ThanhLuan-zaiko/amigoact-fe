import type { ReactElement } from "react";
import { FiImage, FiUsers } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { useOrgMedia } from "../hooks.ts";
import { orgMediaUrl, type DashboardOrg } from "../api.ts";
import { orgStatusBucket } from "../schemas.ts";
import { ORG_KIND_LABELS, ORG_STATUS_LABELS } from "../messages.tsx";
import { OrgCardActions } from "./OrgCardActions.tsx";
import { OrgEditCard } from "./OrgEditCard.tsx";
import { OrgMediaStrip } from "./OrgMediaStrip.tsx";

interface OrgRowProps {
  org: DashboardOrg;
  editing: boolean;
  compact: boolean;
  onEdit: () => void;
  onOpenMedia: () => void;
}

const STATUS_BADGES: Record<string, string> = {
  pending:
    "border-amber-300 bg-amber-50 text-amber-700 " +
    "dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400",
};
const FALLBACK_BADGE =
  "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400";

function createdLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

export function OrgRow({
  org,
  editing,
  compact,
  onEdit,
  onOpenMedia,
}: OrgRowProps): ReactElement {
  const gallery = useOrgMedia(org.id, !compact);
  const media = gallery.data ?? [];
  const avatar =
    media.find((item) => item.kind === "image" && item.role === "logo") ??
    media.find((item) => item.kind === "image" && item.role === "cover") ??
    media.find((item) => item.kind === "image");
  const bucket = orgStatusBucket(org);
  const badge = bucket === "active" ? null : STATUS_BADGES[bucket] ?? FALLBACK_BADGE;
  const created = createdLabel(org.created_at);

  return (
    <li
      data-rise
      className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {avatar ? (
            <img
              src={orgMediaUrl(avatar.file_url)}
              alt=""
              loading="lazy"
              className="h-14 w-14 shrink-0 rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-500">
              <FiUsers className="h-5 w-5" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {org.name}
              </p>
              {badge && (
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge}`}>
                  {ORG_STATUS_LABELS[bucket] ?? bucket}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {ORG_KIND_LABELS[org.kind] ?? org.kind} · @{org.slug} · {org.member_count} thành viên · {org.event_count} sự kiện
              {created ? ` · tạo ${created}` : ""}
            </p>
            {org.description && (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {org.description}
              </p>
            )}
          </div>
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
                onClick={onOpenMedia}
                aria-haspopup="dialog"
                icon={<FiImage className="h-4 w-4" aria-hidden="true" />}
              >
                Tệp
              </Button>
            </>
          )}
        </div>
      </div>
      {!compact && media.length > 0 && (
        <OrgMediaStrip media={media} onBrowse={onOpenMedia} />
      )}
      <OrgCardActions org={org} isEditing={editing} onEdit={onEdit} />
      {editing && <OrgEditCard org={org} onDone={onEdit} />}
    </li>
  );
}
