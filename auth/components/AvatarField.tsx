import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import { FiCamera, FiUser, FiX } from "react-icons/fi";
import { Button } from "../../core/components/Button.tsx";
import { toVietnameseMessage } from "../messages.tsx";

interface AvatarFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

// Optional avatar picker for the register wizard. The file stays local
// until the account exists; RegisterCard uploads it through the shared
// POST /profiles/me/avatar endpoint (same one /manage/volunteer uses)
// right after the auto-login step.
export function AvatarField({
  file,
  onChange,
  disabled = false,
}: AvatarFieldProps): ReactElement {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Releasing the previous object URL on change/unmount keeps memory clean.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pick = (): void => inputRef.current?.click();

  const onFile = (next: File | undefined): void => {
    if (!next) return;
    if (next.type !== "" && !next.type.startsWith("image/")) {
      setError(toVietnameseMessage("UNSUPPORTED_MEDIA"));
      return;
    }
    setError(null);
    setPreview(URL.createObjectURL(next));
    onChange(next);
  };

  const clear = (): void => {
    setError(null);
    setPreview(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        Ảnh đại diện{" "}
        <span className="font-normal text-zinc-500 dark:text-zinc-400">
          (không bắt buộc)
        </span>
      </span>
      <div className="mt-1 flex items-center gap-3">
        {preview ? (
          <img
            src={preview}
            alt="Xem trước ảnh đại diện"
            className="h-20 w-20 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500"
          >
            <FiUser className="h-8 w-8" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Hiển thị trên hồ sơ tình nguyện và bảng xếp hạng. Bạn có thể cập
            nhật lại sau.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={disabled}
              onClick={pick}
              icon={<FiCamera className="h-4 w-4" aria-hidden="true" />}
            >
              {file ? "Đổi ảnh" : "Chọn ảnh"}
            </Button>
            {file && (
              <Button
                type="button"
                variant="ghost"
                disabled={disabled}
                onClick={clear}
                icon={<FiX className="h-4 w-4" aria-hidden="true" />}
              >
                Xóa
              </Button>
            )}
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
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
