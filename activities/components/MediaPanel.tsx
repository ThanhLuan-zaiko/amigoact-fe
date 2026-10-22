import { useRef, useState, type ReactElement } from "react";
import { FiPlay, FiTrash2, FiUpload } from "react-icons/fi";
import { ApiError } from "../../core/api.ts";
import { Button } from "../../core/components/Button.tsx";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../core/components/Feedback.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import { orgMediaUrl } from "../../orgs/api.ts";
import {
  useActivityMedia,
  useDeleteActivityMedia,
  useUploadActivityMedia,
} from "../media-hooks.ts";

interface MediaPanelProps {
  activityId: string;
}

/** Manager gallery editor: upload, caption-free grid, per-item delete. */
export function MediaPanel({ activityId }: MediaPanelProps): ReactElement {
  const media = useActivityMedia(activityId);
  const upload = useUploadActivityMedia(activityId);
  const del = useDeleteActivityMedia(activityId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  const submit = async (): Promise<void> => {
    setError("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Chọn một tệp ảnh hoặc video.");
      return;
    }
    try {
      await upload.mutateAsync({
        file,
        caption: caption.trim() || undefined,
      });
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Có lỗi xảy ra.",
      );
    }
  };

  if (media.isPending) {
    return <LoadingState label="Đang tải thư viện…" />;
  }
  if (media.isError) {
    return (
      <ErrorState title="Không tải được" message={media.error?.message} />
    );
  }
  const rows = media.data ?? [];

  return (
    <div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
        Thư viện hoạt động
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Ảnh và video hiển thị công khai trên trang chi tiết hoạt động.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="media-file"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tệp media
          </label>
          <input
            id="media-file"
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-300 dark:hover:file:bg-zinc-700"
          />
        </div>
        <TextField
          label="Chú thích (tùy chọn)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Khoảnh khắc đáng nhớ"
          className="flex-1"
        />
        <Button
          variant="secondary"
          disabled={upload.isPending}
          onClick={() => void submit()}
          icon={<FiUpload className="h-4 w-4" aria-hidden="true" />}
        >
          Tải lên
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <div className="mt-3">
          <EmptyState
            title="Chưa có media"
            message="Tải ảnh hoặc video đầu tiên cho hoạt động."
          />
        </div>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {rows.map((m) => (
            <li
              key={m.asset_id}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              {m.kind === "video" ? (
                <div className="relative">
                  <video
                    src={orgMediaUrl(m.file_url)}
                    className="aspect-video w-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <FiPlay
                    className="absolute left-1.5 top-1.5 h-4 w-4 text-white"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <img
                  src={orgMediaUrl(m.file_url)}
                  alt={m.caption ?? m.original_name ?? "Media hoạt động"}
                  className="aspect-video w-full object-cover"
                  loading="lazy"
                />
              )}
              {m.caption && (
                <p className="truncate px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {m.caption}
                </p>
              )}
              <button
                type="button"
                aria-label="Xóa media"
                disabled={del.isPending}
                onClick={() =>
                  void del.mutateAsync({ assetId: m.asset_id })
                }
                className="absolute right-1.5 top-1.5 hidden rounded-lg bg-zinc-900/70 p-1.5 text-white group-hover:block focus-visible:block"
              >
                <FiTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
