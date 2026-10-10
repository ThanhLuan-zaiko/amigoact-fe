import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiHexagon, FiImage, FiLayout, FiPlus, FiTrash2, FiUploadCloud, FiX, FiXOctagon } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { useRiseOn } from "../../core/motion.ts";
import { orgMediaUrl, type MediaRole } from "../api.ts";
import { assignMediaRole } from "../schemas.ts";
import type { PendingMedia } from "../schemas.ts";
import {
  useDeleteAllOrgMedia,
  useDeleteOrgMedia,
  useOrgMedia,
  useSetOrgMediaRole,
  useUploadOrgMedia,
} from "../hooks.ts";
import { MEDIA_ROLE_LABELS, toVietnameseDashboardMessage } from "../messages.tsx";
import { MediaPicker } from "./MediaPicker.tsx";

const ROLE_ICONS: Record<MediaRole, typeof FiImage> = { gallery: FiImage, cover: FiLayout, logo: FiHexagon };
const PAGE_SIZE = 50;

interface MediaDropzoneProps {
  orgId: string;
  canManage: boolean;
}

export function MediaDropzone({ orgId, canManage }: MediaDropzoneProps): ReactElement {
  const gallery = useOrgMedia(orgId);
  const upload = useUploadOrgMedia(orgId);
  const setRole = useSetOrgMediaRole(orgId);
  const remove = useDeleteOrgMedia(orgId);
  const wipe = useDeleteAllOrgMedia(orgId);
  const listRef = useRiseOn<HTMLUListElement>(gallery.data?.length);
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [failedName, setFailedName] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const abortRef = useRef<AbortController | null>(null);
  const total = gallery.data?.length ?? 0;
  const shown = (gallery.data ?? []).slice(0, visible);
  useEffect(() => {
    if (!confirmWipe) return;
    const timer = setTimeout(() => setConfirmWipe(false), 8000);
    return () => clearTimeout(timer);
  }, [confirmWipe]);
  async function flushPending(): Promise<void> {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setServerCode(null);
    setFailedName(null);
    const queue = pending;
    setProgress({ done: 0, total: queue.length });
    let completed = 0;
    for (let i = 0; i < queue.length; i += 1) {
      if (ctrl.signal.aborted) break;
      try {
        await upload.mutateAsync({ file: queue[i].file, role: queue[i].role });
        completed = i + 1;
        setProgress({ done: completed, total: queue.length });
      } catch (error) {
        setFailedName(queue[i].file.name);
        setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
        break;
      }
    }
    abortRef.current = null;
    setProgress(null);
    setPending(queue.slice(completed));
  }
  function cancelUpload(): void {
    abortRef.current?.abort();
  }
  function markRole(mediaId: string, role: MediaRole): void {
    setServerCode(null);
    setRole.mutate({ mediaId, role }, { onError: (e) => setServerCode(e instanceof ApiError ? e.code : "REQUEST_FAILED") });
  }
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <MediaPicker
        items={pending}
        disabled={upload.isPending}
        allowRoles={canManage}
        hint={toVietnameseDashboardMessage("DROP_HINT_STAGE")}
        onAdd={(picked) => {
          const mapped: PendingMedia[] = picked.map(({ file, decodable }) => ({ file, role: "gallery", cropped: false, decodable }));
          setPending((prev) => [...prev, ...mapped]);
        }}
        onRemove={(index) => setPending((prev) => prev.filter((_, i) => i !== index))}
        onRole={(index, role) => setPending((prev) => assignMediaRole(prev, index, role))}
        onCropApply={(index, file) => setPending((prev) => prev.map((item, i) => (i === index ? { ...item, file, cropped: true } : item)))}
      />
      {pending.length > 0 && !upload.isPending && (
        <Button type="button" variant="primary" onClick={() => void flushPending()} icon={<FiUploadCloud className="h-4 w-4" aria-hidden="true" />} className="w-full sm:w-auto sm:self-start">
          {`Tải lên ${pending.length} tệp`}
        </Button>
      )}
      {upload.isPending && (
        <div className="flex flex-wrap items-center gap-2">
          <LoadingState label={progress ? `Đang tải ${progress.done}/${progress.total}…` : "Đang tải lên…"} />
          <Button type="button" variant="secondary" onClick={cancelUpload} icon={<FiX className="h-4 w-4" aria-hidden="true" />}>
            Hủy
          </Button>
        </div>
      )}
      {canManage && total > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={wipe.isPending}
            aria-pressed={confirmWipe}
            onClick={() => {
              if (!confirmWipe) {
                setConfirmWipe(true);
                return;
              }
              setServerCode(null);
              wipe.mutate(undefined, {
                onSuccess: () => setConfirmWipe(false),
                onError: (error) => setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED"),
              });
            }}
            icon={<FiXOctagon className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
            className={confirmWipe ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400" : undefined}
          >
            {wipe.isPending ? "Đang xóa…" : confirmWipe ? `Xóa ${total} tệp? Bấm lại để chắc chắn` : "Xóa tất cả"}
          </Button>
        </div>
      )}
      {serverCode && (
        <ErrorState title={failedName ? `Không tải được “${failedName}”` : "Không tải được"} message={toVietnameseDashboardMessage(serverCode)} />
      )}
      <div aria-live="polite" aria-busy={gallery.isPending}>
        {gallery.isPending && gallery.data === undefined && <LoadingState label="Đang tải thư viện…" />}
        {gallery.data && total === 0 && <EmptyState title="Chưa có tệp nào" message="Ảnh và video của tổ chức sẽ hiện ở đây." />}
        {total > 0 && (
          <>
            {/* Single column on phones so role buttons never squeeze the dialog wider. */}
            <ul ref={listRef} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {shown.map((item) => (
                <li key={item.id} data-rise className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800">
                  <div className="relative">
                    {item.kind === "video" ? (
                      <video src={orgMediaUrl(item.file_url)} controls preload="none" className="aspect-video w-full rounded-lg bg-zinc-950" />
                    ) : (
                      <img src={orgMediaUrl(item.file_url)} alt="Ảnh của tổ chức" loading="lazy" className="aspect-video w-full rounded-lg object-cover" />
                    )}
                    {item.role !== "gallery" && (
                      <span className="absolute left-1 top-1 rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-xs text-zinc-100">
                        {MEDIA_ROLE_LABELS[item.role]}
                      </span>
                    )}
                  </div>
                  {item.original_name && (
                    <p
                      className="truncate text-xs text-zinc-500 dark:text-zinc-400"
                      title={item.original_name}
                    >
                      {item.original_name}
                    </p>
                  )}
                  {canManage && item.kind === "image" && (
                    <div className="flex gap-1" role="group" aria-label="Vai trò ảnh">
                      {(["cover", "logo"] as MediaRole[]).map((role) => {
                        const RoleIcon = ROLE_ICONS[role];
                        return (
                          <Button key={role} type="button" variant={item.role === role ? "primary" : "secondary"} aria-pressed={item.role === role} disabled={setRole.isPending} onClick={() => markRole(item.id, item.role === role ? "gallery" : role)} icon={<RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />} className="flex-1 px-2 py-1 text-xs">
                            {MEDIA_ROLE_LABELS[role]}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                  {canManage && (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={remove.isPending}
                      onClick={() => {
                        setServerCode(null);
                        remove.mutate(item.id, { onError: (error) => setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED") });
                      }}
                      icon={<FiTrash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />}
                      className="w-full"
                    >
                      Xóa tệp
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            {visible < total && (
              <div className="mt-3 flex justify-center">
                <Button type="button" variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)} icon={<FiPlus className="h-4 w-4" aria-hidden="true" />}>
                  {`Xem thêm (${total - visible} còn lại)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
