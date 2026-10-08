import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent, ReactElement } from "react";
import { FiHexagon, FiImage, FiLayout, FiScissors, FiUploadCloud, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";
import { Button } from "../../core/components/Button.tsx";
import { isSupportedMedia, defaultAspectForRole } from "../schemas.ts";
import type { PendingMedia } from "../schemas.ts";
import type { MediaRole } from "../api.ts";
import { MEDIA_ROLE_LABELS, toVietnameseDashboardMessage } from "../messages.tsx";
import { ImageCropper } from "./ImageCropper.tsx";

const ROLE_CHOICES: { role: MediaRole; Icon: IconType }[] = [
  { role: "gallery", Icon: FiImage },
  { role: "cover", Icon: FiLayout },
  { role: "logo", Icon: FiHexagon },
];

interface MediaPickerProps {
  items: PendingMedia[];
  disabled: boolean;
  allowRoles?: boolean;
  hint?: string;
  onAdd: (files: { file: File; decodable: boolean }[]) => void;
  onRemove: (index: number) => void;
  onRole: (index: number, role: MediaRole) => void;
  onCropApply: (index: number, file: File) => void;
}

// Some files claim image/* but browsers cannot decode them (HEIC renamed
// to .jpg, CMYK JPEG, truncated downloads). Probe once at pick time so the
// crop button only shows for images the browser can actually read.
async function canDecodeImage(file: File): Promise<boolean> {
  try {
    const bitmap = await createImageBitmap(file);
    bitmap.close();
    return true;
  } catch {
    return false;
  }
}

export function MediaPicker({ items, disabled, allowRoles = true, hint, onAdd, onRemove, onRole, onCropApply }: MediaPickerProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState(0);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const previews = useMemo(
    () => items.map((item) => ({ item, url: URL.createObjectURL(item.file) })),
    [items],
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
    if (ok.length === 0) return;
    void Promise.all(
      ok.map(async (file) => ({
        file,
        decodable: !file.type.startsWith("image/") || (await canDecodeImage(file)),
      })),
    ).then(onAdd);
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault();
    setDragging(false);
    if (!disabled && event.dataTransfer.files.length > 0) take(event.dataTransfer.files);
  }

  if (cropIndex !== null && items[cropIndex]) {
    const item = items[cropIndex];
    return (
      <ImageCropper
        file={item.file}
        defaultAspect={defaultAspectForRole(item.role)}
        onApply={(file) => {
          onCropApply(cropIndex, file);
          setCropIndex(null);
        }}
        onCancel={() => setCropIndex(null)}
      />
    );
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
        <span className="text-xs">
          {hint ?? "Ảnh ≤10MB · Video ≤100MB · Tải lên sau khi tạo tổ chức"}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*,.heic,.heif,.tiff,.tif,.bmp,.avif"
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
          {previews.map((preview, index) => {
            const isImage = preview.item.file.type.startsWith("image/");
            return (
              <li
                key={`${preview.item.file.name}-${index}`}
                className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-2 dark:border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  {preview.item.file.type.startsWith("video") ? (
                    <video src={preview.url} preload="metadata" className="h-12 w-16 shrink-0 rounded-lg bg-zinc-950 object-cover" />
                  ) : (
                    <img src={preview.url} alt="" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-zinc-900 dark:text-zinc-100">
                      {preview.item.file.name}
                    </p>
                    {preview.item.cropped && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Đã cắt</p>
                    )}
                    {isImage && preview.item.decodable === false && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Trình duyệt không đọc được để cắt — vẫn tải lên nguyên gốc.
                      </p>
                    )}
                  </div>
                  {isImage && preview.item.decodable !== false && (
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={disabled}
                      onClick={() => setCropIndex(index)}
                      icon={<FiScissors className="h-4 w-4" aria-hidden="true" />}
                    >
                      Cắt
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={disabled}
                    onClick={() => onRemove(index)}
                    aria-label={`Gỡ ${preview.item.file.name}`}
                    icon={<FiX className="h-4 w-4" aria-hidden="true" />}
                  >
                    Gỡ
                  </Button>
                </div>
                {isImage && allowRoles && (
                  <div className="flex flex-wrap gap-1" role="group" aria-label="Vai trò ảnh">
                    {ROLE_CHOICES.map(({ role, Icon }) => (
                      <Button
                        key={role}
                        type="button"
                        variant={preview.item.role === role ? "primary" : "secondary"}
                        disabled={disabled}
                        aria-pressed={preview.item.role === role}
                        onClick={() => onRole(index, role)}
                        icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
                        className="px-2 py-1 text-xs"
                      >
                        {MEDIA_ROLE_LABELS[role]}
                      </Button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
