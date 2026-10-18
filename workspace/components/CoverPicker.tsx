import { useRef } from "react";
import type { ReactElement } from "react";
import { FiImage, FiLoader, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import type { MediaLookup } from "../article.ts";
import type { UploadState } from "../editor-hooks.ts";

const COVER_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff,image/heic,image/heif";

interface CoverPickerProps {
  coverId: string | null;
  lookup: MediaLookup;
  upload?: UploadState;
  onChange: (file: File | null) => void;
}

// Cover image slot on the publish panel: pick / preview / swap / remove.
// Uploads run through the board post-media pipeline, as block images do.
export function CoverPicker({
  coverId,
  lookup,
  upload,
  onChange,
}: CoverPickerProps): ReactElement {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const cover = coverId === null ? undefined : lookup[coverId];

  function choose(input: HTMLInputElement | null): void {
    if (input === null) return;
    const file = input.files?.[0];
    input.value = "";
    if (file) onChange(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Ảnh bìa
      </p>
      {cover !== undefined ? (
        <div className="flex flex-col gap-2">
          <img
            src={cover.url}
            alt="Ảnh bìa bài viết"
            className="aspect-video w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-800"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              icon={<FiImage className="h-4 w-4" aria-hidden="true" />}
            >
              Đổi ảnh
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(null)}
              aria-label="Gỡ ảnh bìa"
              icon={<FiX className="h-4 w-4" aria-hidden="true" />}
            >
              Gỡ
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={upload === "uploading"}
          className="flex min-h-[88px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-400"
        >
          {upload === "uploading" ? (
            <>
              <FiLoader className="h-5 w-5 animate-spin" aria-hidden="true" />
              <span className="text-sm">Đang tải ảnh bìa lên…</span>
            </>
          ) : upload === "failed" ? (
            <>
              <FiImage className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">Tải lên thất bại — bấm để thử lại</span>
            </>
          ) : (
            <>
              <FiImage className="h-5 w-5" aria-hidden="true" />
              <span className="text-sm">Chọn ảnh bìa</span>
            </>
          )}
        </button>
      )}
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Ảnh hiển thị trên thẻ bài viết ở bảng tin.
      </p>
      <input
        ref={fileRef}
        type="file"
        accept={COVER_ACCEPT}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => choose(event.target)}
      />
    </div>
  );
}
