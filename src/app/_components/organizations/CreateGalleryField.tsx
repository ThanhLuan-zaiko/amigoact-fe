"use client";

import { type DragEvent, useId, useState } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { uploadMessage } from "@/lib/forms";
import {
  GALLERY_ACCEPT,
  GALLERY_MAX_ITEMS,
  galleryFileError,
  isVideo,
} from "@/lib/pictureRules";
import { fieldLabel, iconButton, mutedText } from "../ui";

type Item = { id: string; mime: string; preview: string };

// Each file goes to POST /media/upload, which returns its asset id.
async function uploadFile(
  file: File,
): Promise<{ id?: string; error?: string }> {
  const body = new FormData();
  body.set("file", file);
  const response = await fetch("/media/upload", { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: uploadMessage(data.code ?? "network_error") };
  }
  return { id: data.id };
}

// The chosen files travel with the create form as hidden asset ids, so the
// organization is created with its gallery in one step.
export default function CreateGalleryField() {
  const inputId = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const room = GALLERY_MAX_ITEMS - items.length;

  // One at a time, so a failure is reported per file and the limit stays exact.
  async function addFiles(files: File[]) {
    setBusy(true);
    const errors: string[] = [];
    let left = room;
    for (const file of files) {
      const invalid =
        left <= 0
          ? `Bộ sưu tập tối đa ${GALLERY_MAX_ITEMS} tệp.`
          : galleryFileError(file);
      if (invalid) {
        errors.push(`${file.name}: ${invalid}`);
        continue;
      }
      const { id, error } = await uploadFile(file);
      if (id) {
        left -= 1;
        const preview = URL.createObjectURL(file);
        setItems((current) => [...current, { id, mime: file.type, preview }]);
      } else {
        errors.push(`${file.name}: ${error}`);
      }
    }
    setFailures(errors);
    setBusy(false);
  }

  function remove(item: Item) {
    URL.revokeObjectURL(item.preview);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  // A dropped file is handled like a chosen one, so the same checks apply.
  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    if (!busy) {
      addFiles(Array.from(event.dataTransfer.files));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2">
        <span className={fieldLabel}>Bộ sưu tập</span>
        <span className={mutedText}>
          {items.length}/{GALLERY_MAX_ITEMS}
        </span>
      </div>
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-md border border-dashed p-6 text-center transition-colors ${
          dragging
            ? "border-teal-700 bg-teal-50 dark:border-teal-400 dark:bg-teal-950/40"
            : "border-slate-300 hover:border-teal-700 dark:border-slate-700 dark:hover:border-teal-400"
        }`}
      >
        <FiUploadCloud aria-hidden="true" className="text-2xl text-slate-500" />
        <span className={fieldLabel}>
          {busy
            ? "Đang tải lên, xong rồi mới tạo tổ chức…"
            : "Kéo thả hoặc bấm để chọn ảnh hoặc video"}
        </span>
        <span className={`${mutedText} text-xs`}>
          Ảnh JPEG, PNG, WEBP tối đa 20 MB. Video MP4, WEBM tối đa 50 MB.
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={GALLERY_ACCEPT}
          disabled={busy || room <= 0}
          onChange={(event) => {
            addFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
          className="sr-only"
        />
      </label>
      {failures.length > 0 ? (
        <ul className="flex flex-col gap-1 text-xs font-semibold text-red-700 dark:text-red-400">
          {failures.map((message) => (
            <li key={message} className="break-words">
              {message}
            </li>
          ))}
        </ul>
      ) : null}
      {items.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2">
              {isVideo(item.mime) ? (
                <video
                  src={item.preview}
                  muted
                  preload="metadata"
                  className="aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
                />
              ) : (
                // biome-ignore lint/performance/noImgElement: local preview of the chosen file.
                <img
                  src={item.preview}
                  alt=""
                  className="aspect-video w-full rounded-md border border-slate-200 object-cover dark:border-slate-800"
                />
              )}
              <button
                type="button"
                aria-label="Gỡ khỏi bộ sưu tập"
                title="Gỡ khỏi bộ sưu tập"
                onClick={() => remove(item)}
                className={iconButton}
              >
                <FiTrash2 aria-hidden="true" />
              </button>
              <input type="hidden" name="gallery_asset_id" value={item.id} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
