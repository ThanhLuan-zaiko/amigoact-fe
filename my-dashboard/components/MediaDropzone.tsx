import { useRef, useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import { EmptyState, ErrorState, LoadingState } from "../../core/components/Feedback.tsx";
import { orgMediaUrl } from "../api.ts";
import { useDeleteOrgMedia, useOrgMedia, useUploadOrgMedia } from "../hooks.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";

interface MediaDropzoneProps {
  orgId: string;
}

export function MediaDropzone({ orgId }: MediaDropzoneProps): ReactElement {
  const gallery = useOrgMedia(orgId);
  const upload = useUploadOrgMedia(orgId);
  const remove = useDeleteOrgMedia(orgId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [serverCode, setServerCode] = useState<string | null>(null);
  const [failedName, setFailedName] = useState<string | null>(null);

  async function putFiles(files: FileList | File[]): Promise<void> {
    setServerCode(null);
    setFailedName(null);
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync(file);
      } catch (error) {
        setFailedName(file.name);
        setServerCode(error instanceof ApiError ? error.code : "REQUEST_FAILED");
        return;
      }
    }
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 0) void putFiles(event.dataTransfer.files);
  }

  return (
    <div className="mt-3 flex flex-col gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800">
      <button
        type="button"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        aria-label="Tải ảnh hoặc video lên"
        className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:focus-visible:outline-brand ${
          dragging
            ? "border-brand bg-brand/10 text-zinc-900 dark:border-brand dark:bg-brand/10 dark:text-zinc-100"
            : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
        }`}
      >
        <FiUploadCloud className="h-5 w-5" aria-hidden="true" />
        <span>{toVietnameseDashboardMessage("DROP_HINT")}</span>
        <span className="text-xs">JPG, PNG, WebP, GIF (≤10MB) · MP4, WebM, MOV (≤100MB)</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          if (event.target.files) void putFiles(event.target.files);
          event.target.value = "";
        }}
      />
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
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.data.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
              >
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
