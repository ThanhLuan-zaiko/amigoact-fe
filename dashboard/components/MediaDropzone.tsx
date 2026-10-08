import { useState } from "react";
import type { ReactElement } from "react";
import { FiHexagon, FiImage, FiLayout, FiTrash2, FiUploadCloud, FiXOctagon } from "react-icons/fi";
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
  const listRef = useRiseOn<HTMLUListElement>(gallery.data);
  const [pending, setPending] = useState<PendingMedia[]>([]);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [failedName, setFailedName] = useState<string | null>(null);

  async function flushPending(): Promise<void> {
    setServerCode(null);
    setFailedName(null);
    const queue = pending;
    let done = 0;
    for (; done < queue.length; done += 1) {
      try {
        await upload.mutateAsync({ file: queue[done].file, role: queue[done].role });
      } catch (error) {
        setFailedName(queue[done].file.name);
        setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
        break;
      }
    }
    setPending(queue.slice(done));
  }

  function markRole(mediaId: string, role: MediaRole): void {
    setServerCode(null);
    setRole.mutate(
      { mediaId, role },
      {
        onError: (error) =>
          setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED"),
      },
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <MediaPicker
        items={pending}
        disabled={upload.isPending}
        allowRoles={canManage}
        hint={toVietnameseDashboardMessage("DROP_HINT_STAGE")}
        onAdd={(picked) =>
          setPending((prev) => [
            ...prev,
            ...picked.map(({ file, decodable }) => ({
              file,
              role: "gallery" as const,
              cropped: false,
              decodable,
            })),
          ])
        }
        onRemove={(index) =>
          setPending((prev) => prev.filter((_, i) => i !== index))
        }
        onRole={(index, role) =>
          setPending((prev) => assignMediaRole(prev, index, role))
        }
        onCropApply={(index, file) =>
          setPending((prev) =>
            prev.map((item, i) => (i === index ? { ...item, file, cropped: true } : item)),
          )
        }
      />
      {pending.length > 0 && (
        <Button
          type="button"
          variant="primary"
          disabled={upload.isPending}
          onClick={() => void flushPending()}
          icon={<FiUploadCloud className="h-4 w-4" aria-hidden="true" />}
          className="w-full sm:w-auto sm:self-start"
        >
          {upload.isPending ? "Đang tải lên…" : `Tải lên ${pending.length} tệp`}
        </Button>
      )}
      {canManage && gallery.data && gallery.data.length > 0 && (
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
                onError: (error) =>
                  setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED"),
              });
            }}
            icon={
              <FiXOctagon
                className="h-4 w-4 text-red-600 dark:text-red-400"
                aria-hidden="true"
              />
            }
            className={
              confirmWipe
                ? "border-red-600 text-red-600 dark:border-red-400 dark:text-red-400"
                : undefined
            }
          >
            {wipe.isPending
              ? "Đang xóa…"
              : confirmWipe
                ? "Bấm lại để xóa tất cả"
                : "Xóa tất cả"}
          </Button>
        </div>
      )}
      {upload.isPending && <LoadingState label="Đang tải lên…" />}
      {serverCode && (
        <ErrorState
          title={failedName ? `Không tải được “${failedName}”` : "Không tải được"}
          message={toVietnameseDashboardMessage(serverCode)}
        />
      )}
      <div aria-live="polite" aria-busy={gallery.isPending}>
        {gallery.isPending && gallery.data === undefined && (
          <LoadingState label="Đang tải thư viện…" />
        )}
        {gallery.data && gallery.data.length === 0 && (
          <EmptyState title="Chưa có tệp nào" message="Ảnh và video của tổ chức sẽ hiện ở đây." />
        )}
        {gallery.data && gallery.data.length > 0 && (
          <ul ref={listRef} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.data.map((item) => (
              <li
                key={item.id}
                data-rise
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
              >
                <div className="relative">
                  {item.kind === "video" ? (
                    <video
                      src={orgMediaUrl(item.file_url)}
                      controls
                      preload="metadata"
                      className="aspect-video w-full rounded-lg bg-zinc-950"
                    />
                  ) : (
                    <img
                      src={orgMediaUrl(item.file_url)}
                      alt="Ảnh của tổ chức"
                      loading="lazy"
                      className="aspect-video w-full rounded-lg object-cover"
                    />
                  )}
                  {item.role !== "gallery" && (
                    <span className="absolute left-1 top-1 rounded-md bg-zinc-950/80 px-1.5 py-0.5 text-xs text-zinc-100">
                      {MEDIA_ROLE_LABELS[item.role]}
                    </span>
                  )}
                </div>
                {canManage && item.kind === "image" && (
                  <div className="flex gap-1" role="group" aria-label="Vai trò ảnh">
                    {(["cover", "logo"] as MediaRole[]).map((role) => {
                      const RoleIcon = ROLE_ICONS[role];
                      return (
                        <Button
                          key={role}
                          type="button"
                          variant={item.role === role ? "primary" : "secondary"}
                          aria-pressed={item.role === role}
                          disabled={setRole.isPending}
                          onClick={() =>
                            markRole(item.id, item.role === role ? "gallery" : role)
                          }
                          icon={<RoleIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                          className="flex-1 px-2 py-1 text-xs"
                        >
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
                      remove.mutate(item.id, {
                        onError: (error) =>
                          setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED"),
                      });
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
        )}
      </div>
    </div>
  );
}
