import { useRef } from "react";
import type { ReactElement } from "react";
import { FiImage, FiLoader, FiRefreshCw } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { TextField } from "../../core/components/TextField.tsx";
import type { EditorBlock, MediaLookup } from "../article.ts";
import type { UploadState } from "../editor-hooks.ts";
import { BLOCK_TYPE_LABELS } from "../messages.tsx";

const MEDIA_ACCEPT: Record<string, string> = {
  image:
    "image/jpeg,image/png,image/webp,image/gif,image/avif,image/bmp,image/tiff,image/heic,image/heif",
  video: "video/mp4,video/webm,video/quicktime",
};

interface MediaBlockEditorProps {
  block: EditorBlock & { type: "image" | "video" };
  lookup: MediaLookup;
  upload?: UploadState;
  onCaption: (caption: string) => void;
  onReplace: (file: File) => void;
}

// Image/video block inside the editor: live preview once the upload has
// landed, progress/error states while it flies, caption field underneath.
export function MediaBlockEditor({
  block,
  lookup,
  upload,
  onCaption,
  onReplace,
}: MediaBlockEditorProps): ReactElement {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const label = BLOCK_TYPE_LABELS[block.type];
  const ref = block.asset_id === "" ? undefined : lookup[block.asset_id];

  function choose(input: HTMLInputElement | null): void {
    if (input === null) return;
    const file = input.files?.[0];
    input.value = "";
    if (file) onReplace(file);
  }

  return (
    <div
      data-media-key={block.key}
      data-media-type={block.type}
      className="flex flex-col gap-2"
    >
      {upload === "uploading" && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <FiLoader
            className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400"
            aria-hidden="true"
          />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Đang tải {label.toLowerCase()} lên…
          </p>
        </div>
      )}
      {upload === "failed" && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950"
        >
          <p className="text-sm text-red-600 dark:text-red-400">
            Tải lên thất bại. Thử lại hoặc xóa khối này.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
          >
            Thử lại
          </Button>
        </div>
      )}
      {upload === undefined && ref === undefined && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-[96px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100 dark:focus-visible:outline-zinc-400"
        >
          <FiImage className="h-5 w-5" aria-hidden="true" />
          <span className="text-sm">Chọn {label.toLowerCase()} để chèn</span>
        </button>
      )}
      {ref !== undefined &&
        (block.type === "image" ? (
          <img
            src={ref.url}
            alt={block.caption.trim() || "Ảnh minh họa bài viết"}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          />
        ) : (
          <video
            src={ref.url}
            controls
            preload="metadata"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
          />
        ))}
      {ref !== undefined && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            icon={<FiRefreshCw className="h-4 w-4" aria-hidden="true" />}
          >
            Thay {label.toLowerCase()}
          </Button>
        </div>
      )}
      <TextField
        label="Chú thích"
        name={`caption-${block.key}`}
        value={block.caption}
        onChange={(event) => onCaption(event.target.value)}
        placeholder="Chú thích hiển thị dưới media (không bắt buộc)…"
        maxLength={300}
      />
      <input
        ref={fileRef}
        type="file"
        accept={MEDIA_ACCEPT[block.type]}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => choose(event.target)}
      />
    </div>
  );
}
