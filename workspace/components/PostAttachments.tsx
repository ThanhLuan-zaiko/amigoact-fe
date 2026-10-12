import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  FiAlertTriangle,
  FiCheck,
  FiPaperclip,
  FiX,
} from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { useUploadOrgMedia } from "../../dashboard/hooks.ts";
import { isSupportedMedia } from "../../dashboard/schemas.ts";
import { MEDIA_ACCEPT } from "../../dashboard/api.ts";

// Mirrors posts/service.py MAX_ATTACHMENTS.
const MAX_ATTACHMENTS = 4;

interface StagedMedia {
  key: string;
  file: File;
  mediaId: string | null;
  failed: boolean;
}

interface PostAttachmentsProps {
  orgId: string;
  onChange: (mediaIds: string[], uploading: boolean) => void;
}

// Attachment strip for the post composer: hidden file input, staged
// chips with per-file upload status, uploads as role "attachment" so
// the assets stay out of the org gallery. Parents remount it via `key`
// to clear the staged list after a successful post.
export function PostAttachments({
  orgId,
  onChange,
}: PostAttachmentsProps): ReactElement {
  const [staged, setStaged] = useState<StagedMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const upload = useUploadOrgMedia(orgId);

  // Report the derived ids/busy flag up whenever staging changes.
  useEffect(() => {
    onChange(
      staged
        .filter((item) => item.mediaId !== null)
        .map((item) => item.mediaId as string),
      staged.some((item) => item.mediaId === null && !item.failed),
    );
  }, [staged, onChange]);

  function stage(files: FileList | File[]): void {
    setError(null);
    const picked = Array.from(files);
    const ok = picked.filter(isSupportedMedia);
    if (ok.length < picked.length) {
      setError(
        "Một số tệp không hợp lệ đã bị bỏ qua (ảnh ≤10MB, video ≤100MB).",
      );
    }
    const room = MAX_ATTACHMENTS - staged.length;
    const accepted = ok.slice(0, Math.max(0, room));
    if (ok.length > accepted.length) {
      setError(`Mỗi bài đính kèm tối đa ${MAX_ATTACHMENTS} tệp.`);
    }
    for (const file of accepted) {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      setStaged((prev) => [
        ...prev,
        { key, file, mediaId: null, failed: false },
      ]);
      upload
        .mutateAsync({ file, role: "attachment" })
        .then((media) =>
          setStaged((prev) =>
            prev.map((item) =>
              item.key === key ? { ...item, mediaId: media.id } : item,
            ),
          ),
        )
        .catch(() =>
          setStaged((prev) =>
            prev.map((item) =>
              item.key === key ? { ...item, failed: true } : item,
            ),
          ),
        );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {staged.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Tệp đính kèm">
          {staged.map((item) => (
            <li
              key={item.key}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              {item.failed ? (
                <FiAlertTriangle
                  className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                  aria-hidden="true"
                />
              ) : item.mediaId !== null ? (
                <FiCheck
                  className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
              ) : (
                <FiPaperclip
                  className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
                  aria-hidden="true"
                />
              )}
              <span className="min-w-0 flex-1 truncate text-zinc-900 dark:text-zinc-100">
                {item.file.name}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.failed
                  ? "Lỗi tải lên"
                  : item.mediaId === null
                    ? "Đang tải…"
                    : "Đã tải"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Gỡ ${item.file.name}`}
                onClick={() =>
                  setStaged((prev) =>
                    prev.filter((entry) => entry.key !== item.key),
                  )
                }
                icon={<FiX className="h-4 w-4" aria-hidden="true" />}
              />
            </li>
          ))}
        </ul>
      )}
      <input
        ref={fileRef}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          if (event.target.files) stage(event.target.files);
          event.target.value = "";
        }}
      />
      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          disabled={staged.length >= MAX_ATTACHMENTS}
          icon={<FiPaperclip className="h-4 w-4" aria-hidden="true" />}
        >
          Đính kèm
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
