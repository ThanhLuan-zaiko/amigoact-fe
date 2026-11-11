"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FiAlertCircle, FiTrash2, FiUploadCloud } from "react-icons/fi";
import {
  isPictureTooLarge,
  PICTURE_ACCEPT,
  PICTURE_MAX_MB,
} from "@/lib/pictureRules";
import { uploadFile } from "../organizations/pictureUpload";
import { fieldLabel, iconButton, mutedText, neutralButton } from "../ui";

type BackgroundPickerProps = {
  currentUrl: string | null;
  // Tells the form which picture the preview should draw.
  onPreview: (url: string | null) => void;
};

// One background picture. It is uploaded as soon as it is chosen, and the form
// carries only the asset id. Removing the current picture sends a flag instead.
export default function BackgroundPicker({
  currentUrl,
  onPreview,
}: BackgroundPickerProps) {
  const inputId = useId();
  const previews = useRef<string[]>([]);
  const [uploadedId, setUploadedId] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasPicture = uploadedId !== null || (currentUrl !== null && !removed);

  // Object URLs are released when the form goes away.
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  async function choose(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!PICTURE_ACCEPT.split(",").includes(file.type)) {
      setError("Ảnh phải là JPEG, PNG hoặc WEBP.");
      return;
    }
    if (isPictureTooLarge(file.size)) {
      setError(`Ảnh tối đa ${PICTURE_MAX_MB} MB.`);
      return;
    }
    setBusy(true);
    setError(null);
    const { id, error: failure } = await uploadFile(file);
    setBusy(false);
    if (!id) {
      setError(failure ?? null);
      return;
    }
    const preview = URL.createObjectURL(file);
    previews.current.push(preview);
    setUploadedId(id);
    setRemoved(false);
    onPreview(preview);
  }

  function remove() {
    setUploadedId(null);
    setRemoved(currentUrl !== null);
    onPreview(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={fieldLabel}>Ảnh nền</span>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={inputId}
          className={`${neutralButton} cursor-pointer ${busy ? "opacity-50" : ""}`}
        >
          <FiUploadCloud aria-hidden="true" />
          {busy ? "Đang tải lên…" : hasPicture ? "Đổi ảnh" : "Chọn ảnh"}
          <input
            id={inputId}
            type="file"
            accept={PICTURE_ACCEPT}
            disabled={busy}
            onChange={(event) => {
              choose(event.currentTarget.files?.[0]);
              event.currentTarget.value = "";
            }}
            className="sr-only"
          />
        </label>
        {hasPicture ? (
          <button
            type="button"
            aria-label="Gỡ ảnh nền"
            title="Gỡ ảnh nền"
            onClick={remove}
            className={iconButton}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        ) : null}
      </div>
      <span className={`${mutedText} text-xs`}>
        JPEG, PNG, WEBP, tối đa {PICTURE_MAX_MB} MB. Nên dùng ảnh ngang tỉ lệ
        A4. Ảnh nền sẽ công khai để người nhận in được.
      </span>
      {error ? (
        <span
          role="alert"
          className="flex items-start gap-1 text-xs font-semibold text-red-700 dark:text-red-400"
        >
          <FiAlertCircle aria-hidden="true" className="mt-0.5 shrink-0" />
          {error}
        </span>
      ) : null}
      {uploadedId ? (
        <input type="hidden" name="background_asset_id" value={uploadedId} />
      ) : null}
      {removed ? (
        <input type="hidden" name="remove_background" value="on" />
      ) : null}
    </div>
  );
}
