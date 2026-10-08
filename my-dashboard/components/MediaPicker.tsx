import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { isSupportedMedia } from "../schemas.ts";
import { toVietnameseDashboardMessage } from "../messages.tsx";

interface MediaPickerProps {
  files: File[];
  disabled: boolean;
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function MediaPicker({ files, disabled, onAdd, onRemove }: MediaPickerProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(0);
  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    const urls = previews.map((preview) => preview.url);
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [previews]);

  function take(list: FileList | File[]): void {
    const picked = Array.from(list);
    const ok = picked.filter(isSupportedMedia);
    setRejected(picked.length - ok.length);
    if (ok.length > 0) onAdd(ok);
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) take(event.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={disabled}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        aria-label="Chọn ảnh hoặc video"
        className={`flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-4 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:outline-brand ${
          dragging
            ? "border-brand bg-brand/10 text-zinc-900 dark:border-brand dark:bg-brand/10 dark:text-zinc-100"
            : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
        }`}
      >
        <FiUploadCloud className="h-5 w-5" aria-hidden="true" />
        <span>{toVietnameseDashboardMessage("DROP_HINT")}</span>
        <span className="text-xs">Ảnh ≤10MB · Video ≤100MB · Tải lên sau khi tạo tổ chức</span>
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
          if (event.target.files) take(event.target.files);
          event.target.value = "";
        }}
      />
      {rejected > 0 && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {rejected} tệp không hợp lệ đã bị bỏ qua (chỉ nhận ảnh ≤10MB, video ≤100MB).
        </p>
      )}
      {previews.length > 0 && (
        <ul className="flex flex-col gap-2">
          {previews.map((preview, index) => (
            <li
              key={`${preview.file.name}-${index}`}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
            >
              {preview.file.type.startsWith("video") ? (
                <video src={preview.url} preload="metadata" className="h-12 w-16 shrink-0 rounded-lg bg-zinc-950 object-cover" />
              ) : (
                <img src={preview.url} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm text-zinc-900 dark:text-zinc-100">
                {preview.file.name}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={disabled}
                onClick={() => onRemove(index)}
                aria-label={`Gỡ ${preview.file.name}`}
                icon={<FiX className="h-4 w-4" aria-hidden="true" />}
              >
                Gỡ
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
