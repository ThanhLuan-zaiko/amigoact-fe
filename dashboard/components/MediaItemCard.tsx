import type { ReactElement } from "react";
import { FiEdit2, FiHexagon, FiImage, FiLayout, FiTrash2 } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { orgMediaUrl } from "../api.ts";
import type { MediaRole, OrgMedia } from "../api.ts";
import { MEDIA_ROLE_LABELS } from "../messages.tsx";

const ROLE_ICONS: Record<MediaRole, typeof FiImage> = { gallery: FiImage, cover: FiLayout, logo: FiHexagon };

function mediaSrc(item: OrgMedia): string {
  const base = orgMediaUrl(item.file_url);
  // Same file_url after an in-place edit would render the cached old bytes.
  return item.updated_at ? `${base}?v=${encodeURIComponent(item.updated_at)}` : base;
}

interface MediaItemCardProps {
  item: OrgMedia;
  canManage: boolean;
  busy: boolean;
  onRole: (mediaId: string, role: MediaRole) => void;
  onEdit: (item: OrgMedia) => void;
  onDelete: (mediaId: string) => void;
}

export function MediaItemCard({ item, canManage, busy, onRole, onEdit, onDelete }: MediaItemCardProps): ReactElement {
  const src = mediaSrc(item);
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
      <div className="relative">
        {item.kind === "video" ? (
          <video src={src} controls preload="none" className="aspect-video w-full rounded-lg bg-zinc-950" />
        ) : (
          <img src={src} alt="Ảnh của tổ chức" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
        )}
        {item.role !== "gallery" && (
          <span className="absolute left-1 top-1 rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-xs text-zinc-100">
            {MEDIA_ROLE_LABELS[item.role]}
          </span>
        )}
      </div>
      {item.original_name && (
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={item.original_name}>
          {item.original_name}
        </p>
      )}
      {canManage && item.kind === "image" && (
        <div className="flex gap-1" role="group" aria-label="Vai trò ảnh">
          {(["cover", "logo"] as MediaRole[]).map((role) => {
            const RoleIcon = ROLE_ICONS[role];
            return (
              <Button key={role} type="button" variant={item.role === role ? "primary" : "secondary"} aria-pressed={item.role === role} disabled={busy} onClick={() => onRole(item.id, item.role === role ? "gallery" : role)} icon={<RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />} className="flex-1 px-2 py-1 text-xs">
                {MEDIA_ROLE_LABELS[role]}
              </Button>
            );
          })}
        </div>
      )}
      {canManage && (
        <div className="flex flex-wrap gap-1">
          {item.kind === "image" && (
            <Button type="button" variant="secondary" disabled={busy} onClick={() => onEdit(item)} icon={<FiEdit2 className="h-4 w-4" aria-hidden="true" />}>
              Chỉnh sửa
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() => onDelete(item.id)}
            icon={<FiTrash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
          >
            Xóa tệp
          </Button>
        </div>
      )}
    </li>
  );
}
