import type { ReactElement } from "react";
import { useRef, useState } from "react";
import { FiCamera, FiUser } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { apiBaseUrl } from "../../core/api.ts";
import { useUploadAvatar } from "../hooks.ts";
import {
  PROFILE_TOAST,
  toastKnownError,
  toastProfileError,
} from "../messages.tsx";

// Avatar upload for the volunteer rail. It saves on its own, outside the
// form's single save, so the card body carries no heading of its own.
export function AvatarCard({
  avatarUrl,
  fullName,
}: {
  avatarUrl: string | null;
  fullName: string;
}): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadAvatar(PROFILE_TOAST.avatarSaved);
  const [error, setError] = useState<string | null>(null);
  const src = avatarUrl ? `${apiBaseUrl()}${avatarUrl}` : null;

  const pick = (): void => inputRef.current?.click();

  const onFile = (file: File | undefined): void => {
    if (!file) return;
    setError(null);
    if (file.type !== "" && !file.type.startsWith("image/")) {
      setError(toastKnownError("UNSUPPORTED_MEDIA"));
      return;
    }
    upload.mutate(file, {
      onError: (err) => setError(toastProfileError(err)),
    });
  };

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center gap-4">
        {src ? (
          <img
            src={src}
            alt={`Ảnh đại diện của ${fullName}`}
            className="h-20 w-20 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
          >
            <FiUser className="h-8 w-8" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ảnh hiển thị trên hồ sơ công khai và bảng xếp hạng.
          </p>
          <div className="mt-2">
            <Button
              variant="secondary"
              disabled={upload.isPending}
              onClick={pick}
              icon={<FiCamera className="h-4 w-4" aria-hidden="true" />}
            >
              {upload.isPending ? "Đang tải lên…" : "Đổi ảnh"}
            </Button>
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label="Chọn ảnh đại diện"
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
